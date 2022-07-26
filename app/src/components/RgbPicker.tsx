import Slider from "@mui/material/Slider";
import { useEffect, useRef, useState } from "react";
import { ledValue, rgbStripType } from "../../../src/ledStrip/types";
import "../styles/rgbPicker.sass";
import { sliderTypes } from "./dashboard/Strip";

type props = {
    color: rgbStripType["color"];
    onChange: (color: rgbStripType["color"]) => void;
    onChangeComplete: (color: rgbStripType["color"]) => void;
    fancySliders: sliderTypes;
};

const RgbPicker: React.FC<props> = ({
    color,
    onChange,
    onChangeComplete,
    fancySliders: fancyColors,
}) => {
    const [value, setValue] = useState(color);

    const sliderRed = useRef<HTMLInputElement | null>(null);
    const sliderGreen = useRef<HTMLInputElement | null>(null);
    const sliderBlue = useRef<HTMLInputElement | null>(null);

    console.log(fancyColors);

    // change slider backgrounds to match color
    useEffect(() => {
        console.log("updateSliders: ", fancyColors);
        if (sliderRed.current && sliderGreen.current && sliderBlue.current) {
            if (fancyColors === "fancyRgb") {
                (
                    sliderRed.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background = `linear-gradient(to right, rgb(0, ${color.green}, ${color.blue}), rgb(255, ${color.green}, ${color.blue}))`;
                (
                    sliderGreen.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background = `linear-gradient(to right, rgb(${color.red}, 0, ${color.blue}), rgb(${color.red}, 255, ${color.blue}))`;
                (
                    sliderBlue.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background = `linear-gradient(to right, rgb(${color.red}, ${color.green}, 0), rgb(${color.red}, ${color.green}, 255))`;
            } else {
                (
                    sliderRed.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background =
                    "linear-gradient(to right,  #2d2d2d, #ff0000)";
                (
                    sliderGreen.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background =
                    "linear-gradient(to right,  #2d2d2d, #00ff00)";
                (
                    sliderBlue.current.childNodes[0]
                        .childNodes[0] as HTMLInputElement
                ).style.background =
                    "linear-gradient(to right,  #2d2d2d, #0000ff)";
            }
        }
    });

    const handleChange = (e: any) => {
        const color = hueToRgb(e.target.value);
        onChange(color);
        setValue(color);
    };

    const handleChangeCommitted = (e: any) => {
        onChangeComplete(value);
    };

    return (
        <div className="rgbPickerContainer">
            <div className="rgbPicker">
                <div className="sliderContainer" ref={sliderRed}>
                    <Slider
                        id="red"
                        aria-label="red"
                        value={color.red}
                        onChange={(e: any) => {
                            const newColor = { ...color, red: e.target.value };
                            setValue(newColor);
                            onChange(newColor);
                        }}
                        onChangeCommitted={handleChangeCommitted}
                        min={0}
                        max={255}
                        track={false}
                    />
                </div>
                <div className="sliderContainer" ref={sliderGreen}>
                    <Slider
                        id="green"
                        aria-label="green"
                        value={color.green}
                        onChange={(e: any) => {
                            const newColor = {
                                ...color,
                                green: e.target.value,
                            };
                            setValue(newColor);
                            onChange(newColor);
                        }}
                        onChangeCommitted={handleChangeCommitted}
                        min={0}
                        max={255}
                        track={false}
                    />
                </div>
                <div className="sliderContainer" ref={sliderBlue}>
                    <Slider
                        id="blue"
                        aria-label="blue"
                        value={color.blue}
                        onChange={(e: any) => {
                            const newColor = { ...color, blue: e.target.value };
                            setValue(newColor);
                            onChange(newColor);
                        }}
                        onChangeCommitted={handleChangeCommitted}
                        min={0}
                        max={255}
                        track={false}
                    />
                </div>
            </div>
        </div>
    );
};

// source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#:~:text=HSL%20to-,RGB,-%3A
// (modified to fit typescript and my needs)
function hueToRgb(h: number): rgbStripType["color"] {
    h /= 765;

    let s = 1,
        l = 0.5,
        r: number,
        g: number,
        b: number;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        red: Math.round(r * 255) as ledValue,
        green: Math.round(g * 255) as ledValue,
        blue: Math.round(b * 255) as ledValue,
    };
}

// source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#:~:text=RGB%20to-,HSL,-%3A
// (modified to fit typescript and my needs)
function rgbToVal({ red: r, green: g, blue: b }: rgbStripType["color"]) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    var hue: number = 0;

    if (max == min) {
        hue = 0; // achromatic
    } else {
        var d = max - min;
        switch (max) {
            case r:
                hue = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                hue = (b - r) / d + 2;
                break;
            case b:
                hue = (r - g) / d + 4;
                break;
        }
        hue /= 6;
    }

    return hue * 765; // adapt hue from 0-1 to 0-765 (which is the input range)
}

export default RgbPicker;
