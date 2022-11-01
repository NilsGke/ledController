import { effect } from "../../../src/effects";

const testEffect = (ws: WebSocket, effect: effect) => {
    ws.send(
        JSON.stringify({
            testEffect: effect,
        })
    );
};

export default testEffect;
