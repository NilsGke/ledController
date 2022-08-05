import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import ws from "./connection";

export const setLedEffect = (strip: rgbStripType, effect: effect) => {
    ws.send(
        JSON.stringify({
            set: "effect",
            stripName: strip.name,
            effectName: effect.name,
        })
    );
};

export const addLedEffect = (newEffect: effect) => {
    ws.send(JSON.stringify({ newEffect: newEffect }));
};

export const editLedEffect = (newEffect: effect) => {
    ws.send(JSON.stringify({ editEffect: newEffect }));
};

export const deleteEffect = (id: effect["id"]) => {
    ws.send(JSON.stringify({ deleteEffect: id }));
};
