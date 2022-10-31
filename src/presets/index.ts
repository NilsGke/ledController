import fs from "fs";
import { sendDataUpdate } from "../..";
import { preset } from "./types";

export const presets: preset[] = [];

export const loadPresets = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        presets.length = 0;
        fs.readFile("./src/presets/presets.json", "utf8", (err, data) => {
            const dataPresets = JSON.parse(data) as preset[];
            dataPresets.forEach((preset) => presets.push(preset));
            resolve();
        });
    });
};

export const newPreset = (preset: preset): Promise<void> => {
    return new Promise((resolve, reject) => {
        console.log("new Preset");

        const newPresets = [...presets, newPreset];
        fs.writeFile(
            "./src/presets/presets.json",
            JSON.stringify(newPresets, null, "    "),
            (err) => {
                if (err) reject();
                loadPresets().then(sendDataUpdate).then(resolve);
            }
        );
    });
};

export const deletePreset = (id: preset["id"]): Promise<void> => {
    return new Promise((resolve, reject) => {
        const index = presets.findIndex((preset) => preset.id === id);

        const newPresets = presets.slice();
        newPresets.splice(index, 1);

        fs.writeFile(
            "src/presets/presets.json",
            JSON.stringify(newPresets, null, "    "),
            (err) => {
                if (err) reject();
                loadPresets().then(sendDataUpdate).then(resolve);
            }
        );
    });
};
