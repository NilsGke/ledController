import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";

export const setLedEffect = (
    ws: WebSocket,
    strip: rgbStripType,
    effect: effect
) => {
    ws.send(
        JSON.stringify({
            set: "effect",
            stripName: strip.name,
            effectName: effect.name,
        })
    );
};

export const addLedEffect = (ws: WebSocket, newEffect: effect) => {
    ws.send(JSON.stringify({ newEffect: newEffect }));
};

export const editLedEffect = (ws: WebSocket, newEffect: effect) => {
    ws.send(JSON.stringify({ editEffect: newEffect }));
};

export const deleteEffect = (ws: WebSocket, id: effect["id"]) => {
    ws.send(JSON.stringify({ deleteEffect: id }));
};
