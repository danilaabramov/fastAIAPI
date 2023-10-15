import {Message} from "./Message";
import {io} from 'socket.io-client'
import React, {useEffect, useState} from "react";
import axios from "axios";

const socket = io(process.env.REACT_APP_API_URL, {
    path: process.env.REACT_APP_SOCKET_PATH
})

export const Chat = () => {
    const [isConnected, setIsConnected] = useState(socket.connected)
    const [messages, setMesages] = useState([])
    const [message, setMesage] = useState('')

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(socket.connected)
        })

        socket.on('disconnect', () => {
            setIsConnected(socket.connected)
        })

        socket.on('join', (data) => {
            setMesages((prevMessages) => [...prevMessages, {...data, type: 'join'}])
        })

        socket.on('chat', (data) => {
            setMesages((prevMessages) => {
                let pm = JSON.parse(JSON.stringify(prevMessages));
                pm = pm.reverse()
                if (data.sid === 'gpt') {
                    for (let i = 0; i < pm.length; ++i) {
                        if (pm[i].type === 'chat' && pm[i].sid !== 'gpt') return [...prevMessages, {
                            ...data, type: 'chat'
                        }]
                        if (pm[i].sid === 'gpt') {
                            pm[i].message = pm[i].message + data.message
                            return [...pm.reverse()]
                        }
                    }
                }

                return [...prevMessages, {...data, type: 'chat'}]
            })
        })
    }, []);

    return (
        <>
            <h2>status: {isConnected ? 'connected' : 'disconnected'}</h2>
            <div style={{
                height: 500,
                overflowY: 'scroll',
                border: 'solid black 1px',
                padding: 10,
                marginTop: 15,
                display: 'flex',
                flexDirection: 'column'
            }}>
                {messages.map((message, index) => (<Message message={message} key={index}/>))}
            </div>

            <input type='text' id='message' onChange={(event) => {
                const value = event.target.value.trim()
                setMesage(value)
            }}/>

            <button onClick={() => {
                if (message && message.length)
                    axios.post(process.env.REACT_APP_API_URL + '/chat', {message}).then(() => null)

                let messageBox = document.getElementById('message')
                messageBox.value = ''
                setMesage('')
            }}>Send
            </button>
        </>
    )
}