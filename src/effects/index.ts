import { sendDataUpdate } from "./../../index";
import { rgbStripType } from "../ledStrip/types";
import fs from "fs";

export type keyframe = {
    step: number;
    color: rgbStripType["color"];
};

export type effect = {
    name: string;
    id: number;
    duration: number;
    transition: "linear" | "none";
    keyframes: keyframe[];
    time?: number;
};

export const effects: effect[] = [];

export const loadEffects = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.readFile("src/effects/effects.json", "utf8", (err, data) => {
            const dataEffects = JSON.parse(data) as effect[];
            effects.push(...dataEffects);
            resolve();
        });
    });
};

export const moveEffect = (id: effect["id"], direction: 1 | -1) => {
    const newEffects = effects.slice();
    const effect = effects.find((effect) => effect.id === id);
    if (effect === undefined)
        return console.warn("effect to move not found in data");
    const index = effects.indexOf(effect);
    if (index + direction === -1 || index + direction === effects.length)
        return console.warn(
            "tried moving effect that is on the edge of the list!"
        );
    const temp = newEffects[index];
    newEffects[index] = newEffects[index + direction];
    newEffects[index + direction] = temp;

    effects.length = 0;
    newEffects.forEach((effect) => effects.push(effect));

    sendDataUpdate();
};
