import gpio from "pigpio";
import { rgbStripType as stripType } from "./types";
const Gpio = gpio.Gpio;

export default class rgbStrip {
    public name: stripType["name"];
    public id: stripType["id"];
    public ports: stripType["ports"];
    public color: stripType["color"] = { red: 0, green: 0, blue: 0 };

    constructor(
        name: stripType["name"],
        id: stripType["id"],
        ports: stripType["ports"]
    ) {
        this.name = name;
        this.id = id;
        this.ports = ports;
    }

    public setColors(color: stripType["color"]): Promise<void> {
        return new Promise((res, rej) => {
            this.color = color;
            // TEMPORARY simulate gpio library
            setTimeout(() => {
                res();
            }, 1000);
        });
    }
}
