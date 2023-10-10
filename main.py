from fastapi import FastAPI
import uvicorn
import g4f
from fastapi.middleware.cors import CORSMiddleware
from sockets import sio_app, chat
import asyncio
import concurrent.futures

app = FastAPI()

def chat_with_gpt3(message):
    response = g4f.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": message}],
        stream=True,
    )
    for token in response:
        asyncio.run(chat('gpt', token))

@app.get("/{message}")
async def home(message: str):  # Define a path parameter 'message'
    loop = asyncio.get_event_loop()
    with concurrent.futures.ThreadPoolExecutor() as pool:
        await loop.run_in_executor(pool, chat_with_gpt3, message)  # Pass the 'message' parameter to chat_with_gpt3

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
