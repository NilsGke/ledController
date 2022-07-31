import { rgbStripType } from "../../../src/ledStrip/types";

/**
 *
 * @param color input color to fix
 * @returns fixed color that does not go darker then #202124
 */
const fixBlack = (color: rgbStripType["color"]): rgbStripType["color"] => {
    if (rgbToHsl(color).l > rgbToHsl({ red: 32, green: 33, blue: 36 }).l)
        return {
            red: color.red < 32 ? 32 : color.red,
            green: color.green < 33 ? 33 : color.green,
            blue: color.blue < 36 ? 36 : color.blue,
        };
    else return color;
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 */
function rgbToHsl(color: rgbStripType["color"]) {
    let red = color.red / 255;
    let green = color.green / 255;
    let blue = color.blue / 255;

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

    return { h, s, l };
}

export default fixBlack;
