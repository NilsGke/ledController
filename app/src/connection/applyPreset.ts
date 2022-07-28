import { preset } from "../../../src/presets/types";
import ws from "./connection";

const applyPreset = (presetName: preset["name"]): void => {
    ws.send(JSON.stringify({
        apply: presetName
    }))
}

export default applyPreset;