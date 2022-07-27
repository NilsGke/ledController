import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import { preset } from "../../../src/presets/types";
import ws from "./connection";

export type infoData = {
    strips: rgbStripType[];
    presets: preset[];
    effects: effect[];
};

export const requestNewData = (): void => ws.send(JSON.stringify({ get: "all" }))


export interface newDataEvent extends Event {
    detail: {
        newData: infoData
    }
}
ws.onmessage = (message) => {
    const event = new CustomEvent("newData", {
        bubbles: true,
        detail: {
            newData: JSON.parse(message.data) as infoData
        }
    });
    ws.dispatchEvent(event)
}
