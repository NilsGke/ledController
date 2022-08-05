import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import { preset } from "../../../src/presets/types";
import ws, { wsEvents } from "./connection";
import { onOff } from "./onOff";

export type infoData = {
    strips: rgbStripType[];
    presets: preset[];
    effects: effect[];
    onOff: onOff;
    sync: boolean;
    activePreset: preset | null;
};

export const requestNewData = (): void =>
    ws.send(JSON.stringify({ get: "all" }));

export interface newDataEvent extends Event {
    detail: {
        newData: infoData;
    };
}
ws.onmessage = (message) => {
    const data = JSON.parse(message.data) as infoData;
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
