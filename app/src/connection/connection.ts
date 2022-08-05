import connection from "../connectionConfig.json";
import { getTimeDifference } from "./timeDifference";

console.log(connection.ip, connection.port);

const ws = new WebSocket(
    `ws://${connection.ip}:${connection.port}`,
    "echo-protocol"
);
ws.onopen = (ev) => {
    console.log(ev);
    wsConnected = true;

    const event = new CustomEvent("connectionOpened", {
        bubbles: true,
    });
    wsEvents.dispatchEvent(event);

    getTimeDifference();
};

const retry = () => {};

export const wsEvents = new EventTarget();

export let wsConnected = false;

export default ws;
