import { rgbStripType } from "../ledStrip/types";

const checkColor = (color: rgbStripType["color"]): boolean => {
    const colorArray = [color.red, color.green, color.blue];

    // check that color is between 0 and 255
    colorArray.forEach((c, i) => {
        if (c > 255 || c < 0) return false;
    });
    return true;
};

export default checkColor;
