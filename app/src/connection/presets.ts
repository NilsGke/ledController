import { preset } from "../../../src/presets/types";
import ws from "./connection";

export const addPreset = (preset: preset) => {
    ws.send(JSON.stringify({ newPreset: preset }));
};

export const deletePreset = (presetId: preset["id"]) => {
    ws.send(JSON.stringify({ deletePreset: presetId }));
};
