import connection from "../connectionConfig.json";

console.log(connection.ip, connection.port);

const ws = new WebSocket(
    `ws://${connection.ip}:${connection.port}`,
    "echo-protocol"
);
ws.onopen = (ev) => {
    console.log(ev);
    wsConnected = true;
    getTimeDifference();
};

type timeDifferenceObj = { timeDifference: number };
interface timeMessageEvent extends Event {
    data: string;
}
const getTimeDifference = () => {
    ws.addEventListener("message", timeMessageHandler);
    ws.send(JSON.stringify({ time: Date.now() }));
};
const timeMessageHandler = (ev: Event) => {
    const { timeDifference: serverTimeDifference } = JSON.parse(
        (ev as timeMessageEvent).data
    ) as timeDifferenceObj;
    console.log(`\x1b[33mserver time difference: ${serverTimeDifference}ms`);
    timeDifference = serverTimeDifference;
    ws.removeEventListener("message", timeMessageHandler);
};

export let timeDifference: number = 0;

export let wsConnected = false;

export default ws;
