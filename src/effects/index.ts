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
            effects.length = 0;
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

export const newEffect = (newEffect: effect): Promise<void> => {
    return new Promise((resolve, reject) => {
        let id = 0;
        while (effects.map((e) => e.id).includes(id)) id++;
        const newEffects: effect[] = effects.slice();

        let counter = 0;
        if (effects.map((e) => e.name).includes(newEffect.name))
            while (
                effects
                    .map((e) => e.name)
                    .includes(newEffect.name + "#" + counter)
            )
                counter++;

        newEffect.name =
            counter != 0 ? newEffect.name + "#" + counter : newEffect.name;

        newEffects.push({ ...newEffect, id });

        fs.writeFile(
            "src/effects/effects.json",
            JSON.stringify(newEffects, null, "    "),
            (err) => {
                if (err) reject();
                loadEffects().then(sendDataUpdate).then(resolve);
            }
        );
    });
};

export const editEffect = (newEffect: effect): Promise<void> => {
    return new Promise((resolve, reject) => {
        const newEffects: effect[] = effects.slice();
        const index = newEffects.findIndex(
            (effect) => effect.id === newEffect.id
        );

        newEffects[index] = newEffect;

        fs.writeFile(
            "src/effects/effects.json",
            JSON.stringify(newEffects, null, "    "),
            (err) => {
                if (err) reject();
                loadEffects().then(sendDataUpdate).then(resolve);
            }
        );
    });
};

export const deleteEffect = (id: effect["id"]): Promise<void> => {
    return new Promise((resolve, reject) => {
        const index = effects.findIndex((effect) => effect.id === id);

        const newEffects = effects.slice();
        newEffects.splice(index, 1);

        fs.writeFile(
            "src/effects/effects.json",
            JSON.stringify(newEffects, null, "    "),
            (err) => {
                if (err) reject();
                loadEffects().then(sendDataUpdate).then(resolve);
            }
        );
    });
};
