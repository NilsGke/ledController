import { useEffect, useRef, useState } from "react";
import { ColorResult, AlphaPicker } from "react-color";
import { rgbStripType } from "../../../../src/ledStrip/types";
import {
    InputLabel,
    Select,
    MenuItem,
    ThemeProvider,
    createTheme,
    FormControl,
} from "@mui/material";

import "../../styles/dashboard/dashboardStrip.sass";
import { effect } from "../../../../src/effects";
import HuePicker from "../HuePicker";
import RgbPicker from "../RgbPicker";
import BrightnessPicker from "../BrightnessPicker";
import sendColorToServer from "../../connection/setColor";
import setLedEffect from "../../connection/ledEffect";

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

    const [currentColor, setCurrentColor] = useState<null | rgbStripType["color"]>(null);
    const [newColor, setNewColor] = useState<null | rgbStripType["color"]>(null);

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

    const selectRef = useRef<HTMLInputElement | null>(null);
    const stripRef = useRef<HTMLInputElement | null>(null);

    const colorString = `rgb(${Math.floor(color.red * alpha)}, ${Math.floor(
        color.green * alpha
    )}, ${Math.floor(color.blue * alpha)})`;
    const actualColorString = `rgb(${strip.color.red}, ${strip.color.green}, ${strip.color.blue})`;

    const changeEffect = (effectName: effect["name"]) => {
        const effect = effects.find((e) => e.name === effectName);
        if (effect === undefined) return;
        setLedEffect(strip, effect);
    };

    useEffect(() => {
        if (stripRef.current === null) return;
        if (strip.effect === null) {
            stripRef.current
                .getAnimations()
                .forEach((animation) => animation.cancel());
            return;
        }

        const animationKeyframes = strip.effect.keyframes.map((frame) => ({
            boxShadow: `0px 0px 40px 0px rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue})`,
            offset: frame.step / 100,
        }));
        const animationTiming = {
            duration: strip.effect.duration,
            iterations: Infinity,
        };
        stripRef.current.animate(animationKeyframes, animationTiming);
    }, [strip.effect]);


    return (
        <div className="stripContainer">
            <div
                className="strip"
                style={{
                    boxShadow: `0px 0px 40px 0px ${colorString}`,
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
                                    setColor(color);
                                }}
                                onChangeComplete={(color) => {
                                    setNewColor(color);
                                }}
                            />
                            <BrightnessPicker
                                color={color as rgbStripType["color"]}
                                onChange={(color) => {
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
                            value={strip.effect === null ? "" : strip.effect.name}
                            label="Effect"
                            onChange={(e) =>
                                changeEffect(e.target.value as string)
                            }
                            ref={selectRef}
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
