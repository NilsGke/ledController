import {
    deleteEffect,
    editEffect,
    moveEffect,
    newEffect,
} from "./effects/index";
import WebSocket from "ws";
import { rgbStripType } from "./ledStrip/types";
import {
    applyPreset,
    getInfoObject,
    onOff,
    setActivePreset,
    setAllOnOff,
    setSync,
    strips,
    sync,
} from "./controller";
import { deletePreset, loadPresets, newPreset, presets } from "./presets";
import { effect, effects } from "./effects";
import { preset } from "./presets/types";
import fs from "fs";
import { sendDataUpdate } from "..";

type messageType = {
    time?: number;

    get?: "strips" | "effects" | "presets" | "all";
    set?: "color" | "effect";

    stripName?: rgbStripType["name"];
    all?: boolean;

    color?: rgbStripType["color"];
    effectName?: effect["name"];

    on?: onOff;
    sync?: sync;

    apply?: preset["id"];
    newPreset?: preset;
    deletePreset?: preset["id"];

    moveEffect?: effect["id"];
    direction?: -1 | 1;

    testEffect?: effect;

    newEffect?: effect;
    editEffect?: effect;
    deleteEffect?: effect["id"];
};

const messageHandler = (message: WebSocket.Data, connection: WebSocket) => {
    // console.log("\x1b[33mnew message: \x1b[0m" + message);

    const m: messageType = JSON.parse(message.toString());

    if (m.on !== undefined) setAllOnOff(m.on);

    if (m.time !== undefined)
        connection.send(
            JSON.stringify({ timeDifference: Date.now() - m.time })
        );

    if (m.get) {
        if (m.get === "all")
            return connection.send(JSON.stringify(getInfoObject()));
    }

    if (m.sync !== undefined) {
        setSync(m.sync);
    }

    if (m.set) {
        const setStrips = [];
        if (m.all || sync) {
            strips.forEach((strip) => setStrips.push(strip));
        } else if (m.stripName) {
            const strip = strips.find((s) => s.name === m.stripName);
            if (strip === undefined)
                return console.error(`strip: ${m.stripName} not found!`);
            else setStrips.push(strip);
        } else {
            return console.error("no strip provided");
        }

        if (m.set === "color") {
            if (m.color) {
                setActivePreset(null);
                const color = m.color;
                setStrips.forEach((strip) => {
                    strip.stopEffect();
                    strip.effect = null;
                    strip.effectRunning = false;
                    strip.setColors(color);
                });
            } else return console.error("color not provided!");
        } else if (m.set === "effect") {
            if (m.effectName) {
                setActivePreset(null);
                const effect = effects.find((eff) => eff.name === m.effectName);
                if (effect === undefined)
                    return console.error("effect not found!");
                effect.time = Date.now();
                setStrips.forEach((strip) => {
                    strip.setEffect(effect);
                });
            } else return console.error("effect not provided!");
        } else return console.error("not specified what to set");
    }

    if (m.testEffect !== undefined) {
        const effect = m.testEffect;
        setSync(true, false);
        setActivePreset(null);
        effect.time = Date.now();
        strips.forEach((strip) => strip.setEffect(effect));
    }

    // presets
    if (m.apply) {
        const preset = presets.find((ps) => ps.id === m.apply);
        if (preset === undefined) return console.error(`preset: ${m.apply}`);
        if (sync) setSync(false, false);
        applyPreset(preset.id);
    }
    if (m.newPreset) newPreset(m.newPreset);
    if (m.deletePreset) deletePreset(m.deletePreset);

    if (m.moveEffect !== undefined) {
        if (m.direction !== undefined) {
            moveEffect(m.moveEffect, m.direction);
        }
    }

    // effects
    if (m.newEffect) newEffect(m.newEffect);
    if (m.editEffect) editEffect(m.editEffect);
    if (m.deleteEffect) deleteEffect(m.deleteEffect);
};

export default messageHandler;
