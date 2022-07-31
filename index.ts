import { getInfoObject, setup } from "./src/controller";
import { port } from "./app/src/connectionConfig.json";
import WebSocket from "ws";
import messageHandler from "./src/messageHandler";
import express from "express";

const app = express();

export const CONFIG = {
    ledRefreshRate: 10,
};

if (process.argv.slice(2).includes("--noLeds"))
    console.log(
        "\x1b[31musing --noLeds flag will log all led chagnes to console instead of applying them to the strips!"
    );
const server = app.listen(port, "", () =>
    console.log("\x1b[32mserver running!\x1b[0m")
);

app.use(express.static(__dirname + "/app/build"));

const wsServer = new WebSocket.Server({
    server,
});

wsServer.on("connection", (connection) => {
    console.log("\x1b[32mconnection\x1b[0m");

    connection.on("message", (message) => messageHandler(message, connection));
    connection.on("close", () => console.log("\x1b[31mclosed\x1b[0m"));
});

export const sendDataUpdate = () => {
    wsServer.clients.forEach((client) => {
        client.send(JSON.stringify(getInfoObject()));
    });
};

setup();
