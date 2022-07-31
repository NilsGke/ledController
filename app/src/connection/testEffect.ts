import { effect } from "../../../src/effects";
import ws from "./connection";

const testEffect = (effect: effect) => {
    ws.send(
        JSON.stringify({
            testEffect: effect,
        })
    );
};

export default testEffect;
