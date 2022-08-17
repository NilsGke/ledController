import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ledValue, rgbStripType } from "../../../../src/ledStrip/types";
import "../../styles/dashboard/dashboardStrip.sass";
import { effect, keyframe } from "../../../../src/effects";
import HuePicker from "../HuePicker";
import RgbPicker from "../RgbPicker";
import BrightnessPicker from "../BrightnessPicker";
import sendColorToServer from "../../connection/setColor";
import { setLedEffect } from "../../connection/ledEffect";
import { isMobile } from "react-device-detect";
// mui
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import timeDifference, {
    returnTimeDifference,
} from "../../connection/timeDifference";
import { musicSyncedPrefix } from "./MusicSyncControls";

type props = {
    data: rgbStripType;
    effects: effect[];
    refresh: () => void;
    sliderType: sliderTypes;
};

export type sliderTypes = "hue" | "rgb" | "fancyRgb";

const DashboardStrip: React.FC<props> = ({
    data: strip,
    effects,
    refresh,
    sliderType: fancySliders,
}) => {
    const [color, setColor] = useState<rgbStripType["color"]>({
        red: strip.color.red,
        green: strip.color.green,
        blue: strip.color.blue,
    });

    const [updateColor, setUpdateColor] = useState<boolean>(true);

    const [currentColor, setCurrentColor] = useState<
        null | rgbStripType["color"]
    >(null);
    const [newColor, setNewColor] = useState<null | rgbStripType["color"]>(
        null
    );

    const alpha = 1;

    // color changes from outside of this component
    useEffect(() => {
        setColor({
            red: strip.color.red,
            green: strip.color.green,
            blue: strip.color.blue,
        });
    }, [strip]);

    // send color to server
    useEffect(() => {
        if (newColor === null) return;
        if (newColor !== currentColor) {
            sendColorToServer(strip.name, newColor);
            setCurrentColor(color);
            setNewColor(null);
        }
    }, [newColor]);

    const stripRef = useRef<HTMLInputElement | null>(null);

    const colorString = `rgb(${color.red}, ${color.green}, ${color.blue})`;
    const actualColorString = `rgb(${strip.color.red}, ${strip.color.green}, ${strip.color.blue})`;

    const changeEffect = (effectName: effect["name"]) => {
        const effect = effects.find((e) => e.name === effectName);
        if (effect === undefined) sendColorToServer(strip.name, color);
        else setLedEffect(strip, effect);
    };

    useLayoutEffect(() => {
        if (strip?.effect === null) return;
        if (strip.effect.time === undefined) strip.effect.time = Date.now(); // this should never happen but just in case and for the compiler its there

        const { duration, time, keyframes, transition } = strip.effect;

        const timePassed = Date.now() + returnTimeDifference() - time;

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
            if (transition === "linear")
                percentTransPassed = Math.round(
                    (100 / transTime) * timeInTransition
                );
            else if (transition === "none") percentTransPassed = 0;

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
                red: (prev.color.red - addColor.red) as ledValue,
                green: (prev.color.green - addColor.green) as ledValue,
                blue: (prev.color.blue - addColor.blue) as ledValue,
            };

            // just to make sure the colors are not above 255
            newColor.red = newColor.red > 255 ? 255 : newColor.red;
            newColor.green = newColor.green > 255 ? 255 : newColor.green;
            newColor.blue = newColor.blue > 255 ? 255 : newColor.blue;

            console.log(
                `%c ${newColor.red} ${newColor.green} ${
                    newColor.blue
                } ${Date.now()}`,
                `background: rgb(${newColor.red}, ${newColor.green}, ${newColor.blue})`
            );

            // IDEA: add cubic function to make transitions more interesting
            // https://blog.maximeheckel.com/posts/cubic-bezier-from-math-to-motion/
            // there could be a function for inbetween keyframes and one for the entire transition

            const colorString: string = `rgb(${newColor.red}, ${newColor.green}, ${newColor.blue})`;

            (
                stripRef.current as HTMLDivElement
            ).style.boxShadow = `0px 0px 40px 0px ${colorString}`;
        } else console.warn("could not determine previous or next keyframe");

        setTimeout(
            () => {
                setUpdateColor(!updateColor);
            },
            isMobile ? 100 : 10
        );
    }, [strip.effect, updateColor]);

    return (
        <div className="stripContainer">
            <div
                className="strip"
                style={{
                    boxShadow: `0px 0px 40px 0px ${colorString}`,
                    transition: isMobile ? "box-shadow .1s linear" : "none",
                }}
                ref={stripRef}
            >
                <div className="header">
                    <div
                        className={
                            "colorDot" +
                            (colorString === actualColorString
                                ? ""
                                : " loading")
                        }
                        style={{ background: actualColorString }}
                    ></div>
                    <h2>{strip.name}</h2>
                </div>
                <div className="colorInput">
                    {fancySliders === "hue" ? (
                        <>
                            <HuePicker
                                color={color as rgbStripType["color"]}
                                onChange={(color) => {
                                    if (strip.effect !== null)
                                        setNewColor(color);
                                    setColor(color);
                                }}
                                onChangeComplete={(color) => {
                                    setNewColor(color);
                                }}
                            />
                            <BrightnessPicker
                                color={color as rgbStripType["color"]}
                                onChange={(color) => {
                                    if (strip.effect !== null)
                                        setNewColor(color);
                                    setColor(color);
                                }}
                                onChangeComplete={(color) => {
                                    setNewColor(color);
                                }}
                            />
                        </>
                    ) : (
                        <RgbPicker
                            color={color as rgbStripType["color"]}
                            onChange={(color) => {
                                if (strip.effect !== null) setNewColor(color);
                                setColor(color);
                            }}
                            onChangeComplete={(color) => {
                                setNewColor(color);
                            }}
                            fancySliders={fancySliders}
                        />
                    )}
                </div>
                <div className="effectContainer">
                    <FormControl sx={{ m: 1, minWidth: 120 }}>
                        <InputLabel id="demo-simple-select-label">
                            Effect
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={
                                strip.effect === null
                                    ? ""
                                    : strip.effect.name.replace(
                                          musicSyncedPrefix,
                                          ""
                                      )
                            }
                            label="Effect"
                            onChange={(e) =>
                                changeEffect(e.target.value as string)
                            }
                        >
                            <MenuItem value={""}>-</MenuItem>
                            {effects.map((effect) => (
                                <MenuItem
                                    key={effect.name + effect.id}
                                    value={effect.name}
                                >
                                    {effect.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>
            </div>
        </div>
    );
};

export default DashboardStrip;
