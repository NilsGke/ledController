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

export const newPreset = (newPreset: preset): Promise<void> => {
    return new Promise((resolve, reject) => {
        let id = 0;
        while (presets.map((p) => p.id).includes(id)) id++;
        const newPresets: preset[] = presets.slice();

        let counter = 0;
        if (presets.map((p) => p.name).includes(newPreset.name))
            while (
                presets
                    .map((p) => p.name)
                    .includes(newPreset.name + "#" + counter)
            )
                counter++;

        newPreset.name =
            counter != 0 ? newPreset.name + "#" + counter : newPreset.name;

        newPresets.push({ ...newPreset, id });

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
