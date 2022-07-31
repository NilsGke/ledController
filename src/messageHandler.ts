import { moveEffect } from "./effects/index";
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
import { loadPresets, presets } from "./presets";
import { effect, effects } from "./effects";
import { preset } from "./presets/types";
import fs from "fs";
import { sendDataUpdate } from "..";

type messageType = {
    get?: "strips" | "effects" | "presets" | "all";
    set?: "color" | "effect";
    stripName?: rgbStripType["name"];
    color?: rgbStripType["color"];
    effectName?: effect["name"];
    all?: boolean;
    apply?: preset["name"];
    on?: onOff;
    sync?: sync;
    newPreset?: preset;
    moveEffect?: effect["id"];
    direction?: -1 | 1;
    testEffect?: effect;
    time?: number;
};

const messageHandler = (message: WebSocket.Data, connection: WebSocket) => {
    console.log("\x1b[33mnew message: \x1b[0m" + message);

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

    if (m.apply) {
        const preset = presets.find((ps) => ps.name === m.apply);
        if (preset === undefined) return console.error(`preset: ${m.apply}`);
        if (sync) setSync(false, false);
        applyPreset(preset.id);
    }

    if (m.newPreset) {
        console.log("new Preset");

        const newPresets = [...presets, m.newPreset];
        fs.writeFileSync(
            "./src/presets/presets.json",
            JSON.stringify(newPresets, null, "    ")
        );
        loadPresets().then(sendDataUpdate);
    }

    if (m.moveEffect !== undefined) {
        if (m.direction !== undefined) {
            moveEffect(m.moveEffect, m.direction);
        }
    }
};

export default messageHandler;
