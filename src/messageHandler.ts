import WebSocket from "ws";
import { rgbStripType } from "./ledStrip/types";
import { strips } from "./controller";
import { presets } from "./presets";
import { effect, effects } from "./effects";


type messageType = {
    get?: "strips" | "effects" | "presets" | "all"
    set?: "color" | "effect"
    data?: dataTypes
    stripName?: rgbStripType["name"]
    color?: rgbStripType["color"]
    effectName?: effect["name"]
    all?: boolean
}

type dataTypes = onOff | color

type onOff = "on" | "off"
type color = rgbStripType["color"]



const messageHandler = (message: WebSocket.Data, connection: WebSocket) => {
    console.log(" " + (new Date()) + message);

    const m: messageType = JSON.parse(message.toString());


    if (m.get)
        if (m.get === "all")
            return connection.send(JSON.stringify({ strips, presets, effects }))

    if (m.set) {
        const setStrips = [];
        if (m.all) {
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
                    strip.setColors(color)
                })
            } else return console.error("color not provided!")
        } else if (m.set === "effect") {
            if (m.effectName) {
                const effect = m.effectName;
                if (effects.find(eff => eff.name === effect) === undefined) return console.error("effect not found!")
                setStrips.forEach(strip => {
                    strip.setEffect(effect)
                })
            } else return console.error("effect not provided!")
        }

    } else return console.error("not specify what to set")





}

export default messageHandler;