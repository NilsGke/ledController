import { setup, strips } from "./src/controller";
import { port } from "./app/src/connectionConfig.json"
import http from "http";
import WebSocket from "ws";
import messageHandler from "./src/messageHandler";
import { presets } from "./src/presets";
import { effects } from "./src/effects";
import { fileResponse } from "./src/responseFile";

export const CONFIG = {
    ledRefreshRate: 200,
};




const server = http.createServer((request, response) => {
    console.log((new Date()) + ' Received request for ' + request.url);


    fileResponse(request.url || "", response)


    response.end();

})

server.listen(port, () => {
    console.log((new Date()) + " Server is listening on port 8080");
})


const wsServer = new WebSocket.Server({
    server: server,
})

wsServer.on("connection", (connection) => {
    console.log((new Date()) + " connection");


    connection.on("message", (message) => messageHandler(message, connection))
    connection.on("close", () => console.log((new Date()) + "closed\n"))
})


export const sendDataUpdate = () => {
    wsServer.clients.forEach(client => {
        client.send(JSON.stringify({ strips, presets, effects }))
    })
}

setup();
