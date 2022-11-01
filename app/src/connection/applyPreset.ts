import { preset } from "../../../src/presets/types";

const applyPreset = (ws: WebSocket, presetName: preset["name"]): void => {
    ws.send(
        JSON.stringify({
            apply: presetName,
        })
    );
};

export default applyPreset;
