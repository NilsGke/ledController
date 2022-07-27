import gpio from "pigpio";
import { CONFIG, sendDataUpdate } from "../..";
import { onOff, setAllOnOff } from "../controller";
import { effect, effects } from "../effects";
import { rgbStripType as stripType } from "./types";
const Gpio = gpio.Gpio;

export default class rgbStrip {
    public name: stripType["name"];
    public id: stripType["id"];
    public ports: stripType["ports"];
    public gpioPorts: { red: gpio.Gpio; green: gpio.Gpio; blue: gpio.Gpio } | undefined;
    public color: stripType["color"] = { red: 0, green: 0, blue: 0 };
    public alpha: stripType["alpha"] = 255;
    public effect: effect | null = null;
    private effectRunning: boolean = false;
    private startingTime: number = 0;
    private onOff: onOff;

    constructor(
        name: stripType["name"],
        id: stripType["id"],
        ports: stripType["ports"]
    ) {
        this.name = name;
        this.id = id;
        this.ports = ports;
        this.onOff = "on";

        try {
            this.gpioPorts = {
                red: new Gpio(ports.red, { mode: Gpio.OUTPUT }),
                green: new Gpio(ports.green, { mode: Gpio.OUTPUT }),
                blue: new Gpio(ports.blue, { mode: Gpio.OUTPUT }),
            };
        } catch (error) {
            console.log(error);
            console.log("\x1b[31m error while initializing gpio ports. You are probably using a device where there are no gpio ports. Be careful, not everything is gonna work!\x1b[0m")
        }
    }

    public setOnOff = (onOff: onOff): void => { this.onOff === onOff }

    public setColors(color: stripType["color"]): Promise<void> {
        return new Promise((res, rej) => {
            this.color = color;
            sendDataUpdate();
            res();
        });
    }

    public setEffect(effectName: effect["name"]): void {
        const effect = effects.find((eff) => eff.name === effectName);
        if (effect === undefined)
            throw new Error(`effect: ${effectName} not found`);

        sendDataUpdate();
    }

    public runEffect(): void {
        if (this.effect === null)
            throw new Error(
                "attempting to start effect while no effect is set!"
            );
        this.effectUpdate();
    }

    private effectUpdate() {
        if (!this.effectRunning) return;

        setTimeout(() => {
            this.updateColors();
        }, CONFIG.ledRefreshRate);
    }

    public updateColors() {
        if (this.onOff === "off") {
            this.gpioPorts?.red.pwmWrite(0)
            this.gpioPorts?.green.pwmWrite(0)
            this.gpioPorts?.blue.pwmWrite(0)
        } else {
            this.gpioPorts?.red.pwmWrite(this.color.red)
            this.gpioPorts?.green.pwmWrite(this.color.green)
            this.gpioPorts?.blue.pwmWrite(this.color.blue)
        }
    }

    public stopEffect(): void { }
}
