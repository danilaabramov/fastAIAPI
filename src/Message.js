export const Message = ({message}) => {
    if (message.type === 'join') return <p>{`${message.sid} just joined`}</p>
    if (message.type === 'chat' && message.message[0] === '<') return (
        <div>
            <p>{message.sid}:</p>
            <p>Error</p>
        </div>
    )
    if (message.type === 'chat') return (
        <div>
            <p>{message.sid}:</p>
            {message.message.replace(/ OpenAI/g, "").replace(/OpenAI/g, "").split('\n').map(str => <p>{str}</p>)}
        </div>
    )
}