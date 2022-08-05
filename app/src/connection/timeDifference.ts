import ws, { wsEvents } from "./connection";

type timeDifferenceObj = { timeDifference: number };
interface timeMessageEvent extends Event {
    data: string;
}

export const getTimeDifference = () => {
    wsEvents.addEventListener("message", timeMessageHandler);
    ws.send(JSON.stringify({ time: Date.now() }));
};

const timeMessageHandler = (ev: Event) => {
    const { timeDifference: serverTimeDifference } = JSON.parse(
        (ev as timeMessageEvent).data
    ) as timeDifferenceObj;
    console.log(`\x1b[33mserver time difference: ${serverTimeDifference}ms`);
    timeDifference = serverTimeDifference;
    wsEvents.removeEventListener("message", timeMessageHandler);
};
let timeDifference: number = 0;

export default timeDifference;
