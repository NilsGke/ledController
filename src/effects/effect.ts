import { rgbStripType } from "../ledStrip/types";
import fs from "fs";

type keyframe = {
    step: number;
    color: rgbStripType["color"];
};

export type effect = {
    name: string;
    id: number;
    duration: number;
    keyframes: keyframe[];
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
