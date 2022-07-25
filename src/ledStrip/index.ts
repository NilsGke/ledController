import gpio from "pigpio";
import { CONFIG } from "../..";
import { effect, effects } from "../effects/effect";
import { rgbStripType as stripType } from "./types";
const Gpio = gpio.Gpio;

export default class rgbStrip {
    public name: stripType["name"];
    public id: stripType["id"];
    public ports: stripType["ports"];
    public gpioPorts: { red: gpio.Gpio; green: gpio.Gpio; blue: gpio.Gpio };
    public color: stripType["color"] = { red: 0, green: 0, blue: 0 };
    public effect: effect | null = null;
    private effectRunning: boolean = false;
    private effectTimer: number = 0;

    constructor(
        name: stripType["name"],
        id: stripType["id"],
        ports: stripType["ports"]
    ) {
        this.name = name;
        this.id = id;
        this.ports = ports;
        this.gpioPorts = {
            red: new Gpio(ports.red, { mode: Gpio.OUTPUT }),
            green: new Gpio(ports.green, { mode: Gpio.OUTPUT }),
            blue: new Gpio(ports.blue, { mode: Gpio.OUTPUT }),
        };
    }

    public setColors(color: stripType["color"]): Promise<void> {
        return new Promise((res, rej) => {
            this.color = color;
            // TEMPORARY simulate async gpio library (idk if its async but i guess it is)
            setTimeout(() => {
                res();
            }, 50);
        });
    }

    public setEffect(effectName: effect["name"]): void {
        const effect = effects.find((eff) => eff.name === effectName);
        if (effect === undefined)
            throw new Error(`effect: ${effectName} not found`);
    }

    public runEffect(): void {
        if (this.effect === null)
            throw new Error(
                "attempting to start effect while no effect is set!"
            );
        this.updateColors();
    }

    private updateColors() {
        if (!this.effectRunning) return;

        setTimeout(() => {
            this.updateColors();
        }, CONFIG.ledRefreshRate);
    }

    public stopEffect(): void {}
}
