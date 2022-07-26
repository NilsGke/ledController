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
import { effect } from "../../../../src/effects/effect";
import HuePicker from "../HuePicker";
import RgbPicker from "../RgbPicker";
import BrightnessPicker from "../BrightnessPicker";

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

    const [currentColor, setCurrentColor] = useState<
        null | rgbStripType["color"]
    >(null);
    const [newColor, setNewColor] = useState<null | rgbStripType["color"]>(
        null
    );

    const alpha = 1;

    const [effect, setEffect] = useState<effect | null>(null);

    useEffect(() => {
        setColor({
            red: strip.color.red,
            green: strip.color.green,
            blue: strip.color.blue,
        });
        const newEffect = effects.find((eff) => strip.effectName === eff.name);
        setEffect(newEffect === undefined ? null : newEffect);
    }, [strip]);

    useEffect(() => {
        if (newColor === null) return;
        if (newColor !== currentColor) {
            fetch(
                `/api/strips/${strip.name}/set/color/${newColor.red}/${newColor.green}/${newColor.blue}`
            ).then(() => {
                refresh();
                setCurrentColor(color);
                setNewColor(null);
            });
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
        if (effect === undefined) return setEffect(null);
        setEffect(effect);
    };

    useEffect(() => {
        if (stripRef.current === null) return;
        if (effect === null) {
            stripRef.current
                .getAnimations()
                .forEach((animation) => animation.cancel());
            return;
        }

        const animationKeyframes = effect.keyframes.map((frame) => ({
            boxShadow: `0px 0px 40px 0px rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue})`,
            offset: frame.step / 100,
        }));
        const animationTiming = {
            duration: effect.duration,
            iterations: Infinity,
        };
        stripRef.current.animate(animationKeyframes, animationTiming);
    }, [effect]);

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
                                    setEffect(null);
                                }}
                                onChangeComplete={(color) => {
                                    setNewColor(color);
                                }}
                            />
                            <BrightnessPicker
                                color={color as rgbStripType["color"]}
                                onChange={(color) => {
                                    setColor(color);
                                    setEffect(null);
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
                                setEffect(null);
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
                            value={effect === null ? "" : effect.name}
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
