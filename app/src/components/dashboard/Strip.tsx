import { useEffect, useRef, useState } from "react";
import { HuePicker, ColorResult, AlphaPicker } from "react-color";
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

type props = {
    data: rgbStripType;
    effects: effect[];
    refresh: () => void;
};

const DashboardStrip: React.FC<props> = ({ data: strip, effects, refresh }) => {
    const [color, setColor] = useState<ColorResult["rgb"]>({
        r: strip.color.red,
        g: strip.color.green,
        b: strip.color.blue,
    });

    const [newColor, setNewColor] = useState<null | ColorResult["rgb"]>(null);

    const [effectName, setEffectName] = useState<effect["name"]>("");

    useEffect(() => {
        setColor({
            r: strip.color.red,
            g: strip.color.green,
            b: strip.color.blue,
        });
    }, [strip]);

    useEffect(() => {
        if (newColor === null) return;
        if (newColor !== color) {
            const alpha = newColor.a === undefined ? 1 : newColor.a;
            const c = {
                r: Math.floor(newColor.r * alpha),
                g: Math.floor(newColor.g * alpha),
                b: Math.floor(newColor.b * alpha),
            };
            fetch(`/api/strips/${strip.name}/set/${c.r}/${c.g}/${c.b}`).then(
                () => {
                    refresh();
                    setNewColor(null);
                }
            );
        }
    }, [newColor]);

    const selectRef = useRef<HTMLInputElement | null>(null);
    const stripRef = useRef<HTMLInputElement | null>(null);

    color.a = color.a === undefined ? 1 : color.a;

    const colorString = `rgb(${Math.floor(color.r * color.a)}, ${Math.floor(
        color.g * color.a
    )}, ${Math.floor(color.b * color.a)})`;
    const actualColorString = `rgb(${strip.color.red}, ${strip.color.green}, ${strip.color.blue})`;

    const changeEffect = (effectName: effect["name"]) => {
        const effect = effects.find((e) => e.name === effectName);
        if (effect === undefined && effectName !== "") return;
        setEffectName(effectName);
        if (selectRef.current !== null) selectRef.current.blur();
    };

    const animationKeyframes = [
        { transform: "rotate(0) scale(1)" },
        { transform: "rotate(360deg) scale(0)" },
    ];

    const animationTiming = {
        duration: 2000,
        iterations: 1,
    };

    console.log(strip);

    useEffect(() => {
        if (effectName === "") return;
        if (stripRef.current === null) return;
        stripRef.current.animate(animationKeyframes, animationTiming);
    }, []);

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
                    <HuePicker
                        color={color}
                        onChange={({ rgb }) => setColor({ ...rgb, a: color.a })}
                        onChangeComplete={({ rgb }) =>
                            setNewColor({ ...rgb, a: color.a })
                        }
                    />
                    <AlphaPicker
                        color={color}
                        onChange={({ rgb }) => setColor({ ...color, a: rgb.a })}
                        onChangeComplete={({ rgb }) =>
                            setNewColor({ ...color, a: rgb.a })
                        }
                    />
                </div>
                <div className="effectContainer">
                    <ThemeProvider
                        theme={createTheme({
                            palette: {
                                mode: "dark",
                            },
                        })}
                    >
                        <FormControl sx={{ m: 1, minWidth: 120 }}>
                            <InputLabel id="demo-simple-select-label">
                                Effect
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={effectName}
                                label="Effect"
                                onChange={(e) => changeEffect(e.target.value)}
                                ref={selectRef}
                            >
                                <MenuItem value={""}>-</MenuItem>
                                {effects.map((effect) => (
                                    <MenuItem value={effect.name}>
                                        {effect.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </ThemeProvider>
                </div>
            </div>
        </div>
    );
};

export default DashboardStrip;