import { effect, keyframe } from "../../../src/effects";
import { ledValue } from "../../../src/ledStrip/types";
import { getClosestPointX, getPointsOnCurve } from "./cubicBezier";

const precision = 200;

const generateCubicGradient = (
    keyframes: keyframe[],
    timingFunction: effect["timingFunction"]
): string => {
    let gradient = "linear-gradient(to right, ";

    const sortedKeyframes = keyframes.slice().sort((a, b) => a.step - b.step);

    if (timingFunction === undefined) return "";

    const curvePoints = getPointsOnCurve(timingFunction.P1, timingFunction.P2);

    const steps: string[] = [];

    for (let i = 0; i < precision; i++) {
        let prev = sortedKeyframes
            .filter((kf) => kf.step <= (100 / precision) * i)
            .at(-1);
        let next = sortedKeyframes
            .filter((kf) => kf.step >= (100 / precision) * i)
            .at(0);

        if (prev === undefined || next === undefined) break;

        const colorDiff = {
            red: Math.round(prev.color.red - next.color.red),
            green: Math.round(prev.color.green - next.color.green),
            blue: Math.round(prev.color.blue - next.color.blue),
        };

        const stepDiff = next.step - prev.step;

        const percentTransPassed =
            getClosestPointX(
                curvePoints,
                ((100 / stepDiff) * ((100 / precision) * i - prev.step)) / 100
            ) * 100;

        const addColor = {
            red: Math.round((colorDiff.red * percentTransPassed) / 100),
            green: Math.round((colorDiff.green * percentTransPassed) / 100),
            blue: Math.round((colorDiff.blue * percentTransPassed) / 100),
        };

        const newColor = {
            red: (prev.color.red - addColor.red) as ledValue,
            green: (prev.color.green - addColor.green) as ledValue,
            blue: (prev.color.blue - addColor.blue) as ledValue,
        };

        // just to make sure the colors are not above 255
        newColor.red = newColor.red > 255 ? 255 : newColor.red;
        newColor.green = newColor.green > 255 ? 255 : newColor.green;
        newColor.blue = newColor.blue > 255 ? 255 : newColor.blue;

        steps.push(
            `rgb(${newColor.red}, ${newColor.green}, ${newColor.blue}) ${
                (100 / precision) * i
            }%`
        );
    }
    gradient += `${steps.join(", ")})`;

    return gradient;
};

export default generateCubicGradient;
