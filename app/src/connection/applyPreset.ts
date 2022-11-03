import { preset } from "../../../src/presets/types";

const applyPreset = (ws: WebSocket, presetId: preset["id"]): void => {
    ws.send(
        JSON.stringify({
            apply: presetId,
        })
    );
};

export default applyPreset;
