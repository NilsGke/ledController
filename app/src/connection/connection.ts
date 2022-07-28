import connection from "../connectionConfig.json"

console.log(connection.ip, connection.port)

const ws = new WebSocket(`ws://${connection.ip}:${connection.port}`, "echo-protocol")
ws.onopen = (ev) => {
    console.log(ev);
}



export default ws;