import { preset } from "../../../src/presets/types";
import ws from "./connection";


const addPreset = (preset: preset) => {
    ws.send(JSON.stringify({ newPreset: preset }))
}
export default addPreset;