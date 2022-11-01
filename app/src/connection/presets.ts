import { preset } from "../../../src/presets/types";

export const addPreset = (ws: WebSocket, preset: preset) => {
    ws.send(JSON.stringify({ newPreset: preset }));
};

export const deletePreset = (ws: WebSocket, presetId: preset["id"]) => {
    ws.send(JSON.stringify({ deletePreset: presetId }));
};
