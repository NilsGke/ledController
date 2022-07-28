import Slider from "@mui/material/Slider";
import { useState } from "react";
import { ledValue, rgbStripType } from "../../../src/ledStrip/types";
import "../styles/huePicker.sass";

type props = {
    color: rgbStripType["color"];
    onChange: (color: rgbStripType["color"]) => void;
    onChangeComplete: (color: rgbStripType["color"]) => void;
};

type hslColor = {
    hue: number;
    saturation: number;
    lightness: number;
};

const HuePicker: React.FC<props> = ({ color, onChange, onChangeComplete }) => {
    const hslColor: hslColor = rgbToHsl(color);

    const [value, setValue] = useState<hslColor>(hslColor);

    const handleChange = (e: any, val: number | number[] | undefined) => {
        const rgbColor = hslToRgb({
            lightness: hslColor.lightness === 0 ? 127.5 : hslColor.lightness,
            saturation: 255,
            hue: val as number,
        });

        onChange(rgbColor);
        setValue(rgbToHsl(rgbColor));
    };

    const handleChangeCommitted = (e: any) => {
        onChangeComplete(hslToRgb(value));
    };

    return (
        <div className="huePickerContainer">
            <div className="huePicker">
                <Slider
                    aria-label="hue"
                    value={rgbToHsl(color).hue}
                    onChange={handleChange}
                    onChangeCommitted={handleChangeCommitted}
                    min={0}
                    max={255}
                    track={false}
                />
            </div>
        </div>
    );
};

// source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#:~:text=RGB%20to-,HSL,-%3A
// (modified to fit typescript and my needs)
function rgbToHsl({ red, green, blue }: rgbStripType["color"]) {
    red /= 255;
    green /= 255;
    blue /= 255;

    var max = Math.max(red, green, blue),
        min = Math.min(red, green, blue);
    var h: number = 0,
        s: number,
        l: number = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case red:
                h = (green - blue) / d + (green < blue ? 6 : 0);
                break;
            case green:
                h = (blue - red) / d + 2;
                break;
            case blue:
                h = (red - green) / d + 4;
                break;
        }
        h /= 6;
    }

    return { hue: h * 255, saturation: s * 255, lightness: l * 255 };
}

// source: https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion#:~:text=HSL%20to-,RGB,-%3A
// (modified to fit typescript and my needs)
function hslToRgb({ hue, saturation, lightness }: hslColor) {
    var r: number, g: number, b: number;

    hue /= 255;
    saturation /= 255;
    lightness /= 255;

    if (saturation == 0) {
        r = g = b = lightness; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p: number, q: number, t: number) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q =
            lightness < 0.5
                ? lightness * (1 + saturation)
                : lightness + saturation - lightness * saturation;
        var p = 2 * lightness - q;
        r = hue2rgb(p, q, hue + 1 / 3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1 / 3);
    }

    return {
        red: Math.round(r * 255),
        green: Math.round(g * 255),
        blue: Math.round(b * 255),
    } as rgbStripType["color"];
}

export default HuePicker;
