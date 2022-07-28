import fs from "fs"
import { preset } from "./types";


export const presets: preset[] = [];

export const loadPresets = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        presets.length = 0;
        fs.readFile("./src/presets/presets.json", "utf8", (err, data) => {
            const dataPresets = JSON.parse(data) as preset[];
            dataPresets.forEach(preset => presets.push(preset))
            resolve();
        })
    })
}