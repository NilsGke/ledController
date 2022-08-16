import { rgbStripType } from "../ledStrip/types";

const checkColor = (color: rgbStripType["color"]): boolean =>
    [color.red, color.green, color.blue].every((val) => val <= 255 && val >= 0);

export default checkColor;
