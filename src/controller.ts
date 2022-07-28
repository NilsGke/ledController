import rgbStrip from "./ledStrip";
import fs from "fs";
import { rgbStripType } from "./ledStrip/types";
import config from "./config.json";
import { preset } from "./presets/types";
import { loadPresets, presets } from "./presets/";
import { effects, loadEffects } from "./effects";
import { sendDataUpdate } from "..";

export const strips: rgbStrip[] = [];

type stripData = {
    name: rgbStripType["name"];
    ports: rgbStripType["ports"];
    id: rgbStripType["id"];
};

export const setup = async () => {
    // generate strips
    await new Promise<void>((resolve, reject) => {
        fs.readFile("./src/strips.json", "utf8", (err, data) => {
            const dataStrips = JSON.parse(data) as stripData[];
            dataStrips.forEach((strip) =>
                strips.push(new rgbStrip(strip.name, strip.id, strip.ports))
            );
            resolve();
        });
    });

    await loadPresets();
    await loadEffects();
    applyPreset(config.defaultPreset);
};

const updateColors = () => {
    strips.forEach((strip) => strip.updateColors());
    sendDataUpdate();
};

// on off
export type onOff = "on" | "off";
export let onOff: onOff = "on";
export const setAllOnOff = (state: onOff) => {
    onOff = state;
    strips.forEach((strip) => strip.setOnOff(state));
    updateColors();
};

// sync
export type sync = boolean;
export let sync: sync = false;
export const setSync = (state: sync, notify?: boolean) => {
    sync = state;
    if (sync) strips.forEach((strip) => strip.setColors(strips[0].color));
    if (notify === undefined || notify === true) updateColors();
};

// preset
export let activePreset: preset | null = null;
export const setActivePreset = (preset: typeof activePreset) =>
    (activePreset = preset);
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

        activePreset = preset;

        const proms = preset.strips.map((presetStrip) => {
            const strip = strips.find((strip) => strip.id === presetStrip.id);

            if (strip === undefined)
                console.warn(
                    `Strip (id: ${presetStrip.id}) not found, check json files (strips and presets)`
                );
            else return strip.setColors(presetStrip.color);
        });

        Promise.all(proms).then(() => {
            sendDataUpdate();
            resolve();
        });
    });
};

// info object
export const getInfoObject = () => ({
    strips,
    presets,
    effects,
    onOff,
    sync,
    activePreset,
});
