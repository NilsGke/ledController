import gpio from "pigpio";
import { CONFIG, sendDataUpdate } from "../..";
import { onOff, setAllOnOff } from "../controller";
import { effect, effects, keyframe } from "../effects";
import { notification } from "../notifications/notifications";
import checkColor from "../util/checkColor";
import { rgbStripType, rgbStripType as stripType } from "./types";
const Gpio = gpio.Gpio;

export default class rgbStrip {
    public name: stripType["name"];
    public id: stripType["id"];
    public ports: stripType["ports"];
    public gpioPorts:
        | { red: gpio.Gpio; green: gpio.Gpio; blue: gpio.Gpio }
        | undefined;
    public color: stripType["color"] = { red: 0, green: 0, blue: 0 };
    public alpha: stripType["alpha"] = 255;
    public effect: effect | null = null;
    public effectRunning: boolean = false;
    private onOff: onOff;
    private notification: notification | null = null;

    constructor(
        name: stripType["name"],
        id: stripType["id"],
        ports: stripType["ports"]
    ) {
        this.name = name;
        this.id = id;
        this.ports = ports;
        this.onOff = "on";

        if (!process.argv.slice(2).includes("--noLeds"))
            try {
                this.gpioPorts = {
                    red: new Gpio(ports.red, { mode: Gpio.OUTPUT }),
                    green: new Gpio(ports.green, { mode: Gpio.OUTPUT }),
                    blue: new Gpio(ports.blue, { mode: Gpio.OUTPUT }),
                };
            } catch (error) {
                console.log(error);
                console.log(
                    "\x1b[31m error while initializing gpio ports. You are probably using a device where there are no gpio ports. Be careful, not everything is gonna work!\x1b[0m"
                );
            }
    }

    public setOnOff = (onOff: onOff): void => {
        this.onOff === onOff;
    };

    public setNotification = (notification: notification) => {
        this.notification = notification;
        this.effectRunning = false;
        this.notificationLoop();
    };
    private notificationLoop = () => {
        if (
            this.notification &&
            this.notification.timeStamp + this.notification.duration >
                Date.now()
        ) {
            console.log("schedule update");
            this.updateColors();
            setTimeout(() => this.notificationLoop(), 100);
        } else {
            this.notification = null;
            if (this.effect !== null) {
                this.effectRunning = true;
                this.effectUpdate();
            } else {
                this.updateColors();
            }
        }
    };

    public setColors(color: stripType["color"], notify: boolean = true): void {
        if (!checkColor(color))
            return console.warn(
                "tried setting color that falls outside of the specified range!",
                color
            );

        this.color = color;
        if (notify) sendDataUpdate();
        this.updateColors();
    }

    public setEffect(effect: effect): void {
        this.effect = effect;

        sendDataUpdate();
        this.runEffect();
    }

    public runEffect(): void {
        if (this.effect === null)
            throw new Error(
                "attempting to start effect while no effect is set!"
            );
        this.effectRunning = true;
        this.effectUpdate();
    }

    private effectUpdate() {
        if (!this.effectRunning || this.effect == null) return;
        if (this.effect.time === undefined) this.effect.time = Date.now(); // this should never happen but just in case and for the compiler its there

        const { duration, time, keyframes } = this.effect;

        const timePassed = Date.now() - time;

        let timeInEffect = timePassed;
        while (timeInEffect >= duration) timeInEffect -= duration;

        let prev: keyframe | undefined, next: keyframe | undefined;

        let timeInTransition = timeInEffect;

        for (let i = 0; i < keyframes.length - 1; i++) {
            if (
                (duration / 100) * keyframes[i].step <= timeInEffect &&
                timeInEffect <= (duration / 100) * keyframes[i + 1].step
            ) {
                // current transition
                prev = keyframes[i];
                next = keyframes[i + 1];
                break;
            } else {
                // previous transition
                timeInTransition -=
                    (duration / 100) * keyframes[i + 1].step -
                    (duration / 100) * keyframes[i].step;
            }
        }

        if (prev !== undefined && next !== undefined) {
            const transTime =
                (duration / 100) * next.step - (duration / 100) * prev.step;

            let percentTransPassed: number = 0;
            if (this.effect.transition === "linear")
                percentTransPassed = Math.round(
                    (100 / transTime) * timeInTransition
                );
            else if (this.effect.transition === "none") percentTransPassed = 0;

            const colorDiff = {
                red: Math.round(prev.color.red - next.color.red),
                green: Math.round(prev.color.green - next.color.green),
                blue: Math.round(prev.color.blue - next.color.blue),
            };

            const addColor = {
                red: Math.round((colorDiff.red * percentTransPassed) / 100),
                green: Math.round((colorDiff.green * percentTransPassed) / 100),
                blue: Math.round((colorDiff.blue * percentTransPassed) / 100),
            };

            const newColor = {
                red: prev.color.red - addColor.red,
                green: prev.color.green - addColor.green,
                blue: prev.color.blue - addColor.blue,
            };

            // just to make sure the colors are not above 255
            newColor.red = newColor.red > 255 ? 255 : newColor.red;
            newColor.green = newColor.green > 255 ? 255 : newColor.green;
            newColor.blue = newColor.blue > 255 ? 255 : newColor.blue;

            // console.log(
            //     `%c ${newColor.red} ${newColor.green} ${
            //         newColor.blue
            //     } ${Date.now()}`,
            //     `background: rgb(${newColor.red}, ${newColor.green}, ${newColor.blue})`
            // );

            // IDEA: add cubic function to make transitions more interesting
            // https://blog.maximeheckel.com/posts/cubic-bezier-from-math-to-motion/
            // there could be a function for inbetween keyframes and one for the entire transition

            this.setColors(newColor as rgbStripType["color"], false);
        } else {
            console.warn("could not determine previous or next keyframe");
        }

        setTimeout(() => {
            this.effectUpdate();
        }, CONFIG.ledRefreshRate);
    }

    public updateColors() {
        const color = this.notification ? this.notification.color : this.color;
        if (process.argv.slice(2).includes("--noLeds"))
            return console.log(
                `%c strip "${this.name}" set to color: ${color.red} ${color.green} ${color.blue}`,
                `background: rgb(${color.red}, ${color.green}, ${color.blue})`
            );
        if (this.onOff === "off") {
            this.gpioPorts?.red.pwmWrite(0);
            this.gpioPorts?.green.pwmWrite(0);
            this.gpioPorts?.blue.pwmWrite(0);
        } else {
            this.gpioPorts?.red.pwmWrite(color.red);
            this.gpioPorts?.green.pwmWrite(color.green);
            this.gpioPorts?.blue.pwmWrite(color.blue);
        }
    }

    public stopEffect(): void {
        this.effectRunning = false;
    }
}
