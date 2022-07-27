import rgbStrip from "./ledStrip";
import fs from "fs";
import { rgbStripType } from "./ledStrip/types";
import config from "./config.json";
import { preset } from "./presets/types";
import { loadPresets, presets } from "./presets/";
import { loadEffects } from "./effects";

export const strips: rgbStrip[] = [];

type stripData = {
    name: rgbStripType["name"];
    ports: rgbStripType["ports"];
    id: rgbStripType["id"];
};

export const setup = async () => {
    await generateStrips();
    await loadPresets();
    await loadEffects();
    applyPreset(config.defaultPreset);
};

const generateStrips = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.readFile("./src/strips.json", "utf8", (err, data) => {
            const dataStrips = JSON.parse(data) as stripData[];
            dataStrips.forEach((strip) =>
                strips.push(new rgbStrip(strip.name, strip.id, strip.ports))
            );
            resolve();
        });
    });
};

export const applyPreset = (
    presetId?: preset["id"],
    presetName?: preset["name"]
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const preset = presets.find(
            (preset) => preset.name === presetName || preset.id === presetId
        );
        if (preset === undefined)
            throw new Error(
                `Preset: "${presetName}" not found in presets. Check the json files!`
            );

        const proms = preset.strips.map((presetStrip) => {
            const strip = strips.find((strip) => strip.id === presetStrip.id);

            if (strip === undefined)
                throw new Error(
                    `Strip (id: ${presetStrip.id}) not found, check json files (strips and presets)`
                );

            return strip.setColors(presetStrip.color);
        });

        Promise.all(proms).then(() => resolve());
    });
};
