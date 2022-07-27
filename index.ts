import { getInfoObject, setup } from "./src/controller";
import { port } from "./app/src/connectionConfig.json"
import WebSocket from "ws";
import messageHandler from "./src/messageHandler";
import express from "express"

const app = express();

export const CONFIG = {
    ledRefreshRate: 200,
};

const server = app.listen(port)

app.use(express.static(__dirname + '/app/build'));


const wsServer = new WebSocket.Server({
    server
})

wsServer.on("connection", (connection) => {
    console.log("\x1b[32mconnection\x1b[0m");

    connection.on("message", (message) => messageHandler(message, connection))
    connection.on("close", () => console.log("\x1b[31mclosed\x1b[0m"))
})


export const sendDataUpdate = () => {
    wsServer.clients.forEach(client => {
        client.send(JSON.stringify(getInfoObject()))
    })
}

setup();
