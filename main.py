from fastapi import FastAPI
import uvicorn
import g4f
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app, chat
import asyncio
import concurrent.futures
from pydantic import BaseModel

app = FastAPI()

def chat_with_gpt3(message):
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message}],
        stream=True,
    )
    for token in response:
        asyncio.run(chat('gpt', token))


class MessageInput(BaseModel):
    message: str

@app.post("/chat")
async def home(data: MessageInput):
    message = data.message
    await chat('я', message)
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, chat_with_gpt3, message)

    return {"status": "processing"}

app.mount('/', app=sio_app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*']
)


if __name__ == '__main__':
    uvicorn.run('main:app', reload=True)
