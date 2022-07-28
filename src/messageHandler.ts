import WebSocket from "ws";
import { rgbStripType } from "./ledStrip/types";
import { applyPreset, getInfoObject, onOff, setAllOnOff, setSync, strips, sync } from "./controller";
import { presets } from "./presets";
import { effect, effects } from "./effects";
import { preset } from "./presets/types";


type messageType = {
    get?: "strips" | "effects" | "presets" | "all"
    set?: "color" | "effect"
    stripName?: rgbStripType["name"]
    color?: rgbStripType["color"]
    effectName?: effect["name"]
    all?: boolean
    apply?: preset["name"]
    on?: onOff
    sync?: sync
}



const messageHandler = (message: WebSocket.Data, connection: WebSocket) => {
    console.log("\x1b[33mnew message: \x1b[0m" + message);

    const m: messageType = JSON.parse(message.toString());

    if (m.on !== undefined)
        setAllOnOff(m.on)


    if (m.get)
        if (m.get === "all")
            return connection.send(JSON.stringify(getInfoObject()))

    if (m.set) {
        const setStrips = [];
        if (m.all || sync) {
            strips.forEach(strip => setStrips.push(strip));
        } else if (m.stripName) {
            const strip = strips.find(s => s.name === m.stripName)
            if (strip === undefined) return console.error(`strip: ${m.stripName} not found!`)
            else setStrips.push(strip)
        } else {
            return console.error("no strip provided")
        }

        if (m.set === "color") {
            if (m.color) {
                const color = m.color;
                setStrips.forEach(strip => {
                    strip.stopEffect();
                    strip.effect = null;
                    strip.setColors(color)
                })
            } else return console.error("color not provided!")
        } else if (m.set === "effect") {
            if (m.effectName) {
                const effect = effects.find(eff => eff.name === m.effectName);
                if (effect === undefined) return console.error("effect not found!")
                effect.time = Date.now();
                setStrips.forEach(strip => {
                    strip.setEffect(effect)
                })
            } else return console.error("effect not provided!")
        } else return console.error("not specified what to set")
    }

    if (m.sync !== undefined)
        setSync(m.sync)

    if (m.apply) {
        const preset = presets.find(ps => ps.name === m.apply)
        if (preset === undefined) return console.error(`preset: ${m.apply}`)
        applyPreset(preset.id);
    }


}

export default messageHandler;