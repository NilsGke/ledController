import { effect, effects } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import { preset } from "../../../src/presets/types";
import { getPointsOnCurve } from "../helpers/cubicBezier";
import { newMessageEvent, wsEvents } from "./messageEvent";
import { onOff } from "./onOff";

export type infoData = {
    strips: rgbStripType[];
    presets: preset[];
    effects: effect[];
    onOff: onOff;
    sync: boolean;
    activePreset: preset | null;
};

export const requestNewData = (ws: WebSocket): void =>
    ws.send(JSON.stringify({ get: "all" }));

export interface newDataEvent extends Event {
    detail: {
        newData: infoData;
    };
}

const messageHandler = (ev: Event) => {
    const event = ev as newMessageEvent;
    const data = JSON.parse(event.detail.message) as infoData;
    // calculate the points for the effects if they have a cubic-bezier-transition
    data.effects = data.effects.map((effect) =>
        effect.timingFunction !== undefined
            ? {
                  ...effect,
                  curvePoints: getPointsOnCurve(
                      effect.timingFunction.P1,
                      effect.timingFunction.P2
                  ),
              }
            : effect
    );
    console.log(data);
    if (
        data.activePreset !== undefined &&
        data.effects !== undefined &&
        data.onOff !== undefined &&
        data.presets !== undefined &&
        data.strips !== undefined &&
        data.sync !== undefined
    ) {
        const event = new CustomEvent("newData", {
            bubbles: true,
            detail: {
                newData: data,
            },
        });
        wsEvents.dispatchEvent(event);
    }
};

wsEvents.addEventListener("message", messageHandler);
