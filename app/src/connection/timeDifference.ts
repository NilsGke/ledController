import ws, { newMessageEvent, wsEvents } from "./connection";

type timeDifferenceObj = { timeDifference: number };

export const getTimeDifference = () => {
    console.log("requesting time");
    wsEvents.addEventListener("message", timeMessageHandler);
    ws.send(JSON.stringify({ time: Date.now() }));
};

const timeMessageHandler = (ev: Event) => {
    console.log("time", ev);
    const data = JSON.parse(
        (ev as newMessageEvent).detail.message
    ) as timeDifferenceObj;

    const serverTimeDifference = data.timeDifference;
    console.log(serverTimeDifference);

    if (serverTimeDifference === undefined) return;

    console.log(`\x1b[33mserver time difference: ${serverTimeDifference}ms`);

    timeDifference = serverTimeDifference;
    wsEvents.removeEventListener("message", timeMessageHandler);
    console.log(timeDifference);
};
export const returnTimeDifference = () => timeDifference;
let timeDifference: number = 2000;

export default timeDifference;
