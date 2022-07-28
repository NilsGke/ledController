import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import ws from "./connection";

const setLedEffect = (strip: rgbStripType, effect: effect) => {
    ws.send(JSON.stringify({ set: "effect", stripName: strip.name, effectName: effect.name }))
}

export default setLedEffect;