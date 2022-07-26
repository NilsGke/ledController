import { useEffect, useRef, useState } from "react";
import { rgbStripType } from "../../../../src/ledStrip/types";
import "../../styles/dashboard/dashboardStrip.sass";
import { effect } from "../../../../src/effects";
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

import { musicSyncedPrefix } from "./MusicSyncControls";
import useLedEffect from "../../hooks/useLedEffect";

type props = {
    ws: WebSocket;
    data: rgbStripType;
    effects: effect[];
    refresh: () => void;
    sliderType: sliderTypes;
};

export type sliderTypes = "hue" | "rgb" | "fancyRgb";

const DashboardStrip: React.FC<props> = ({
    ws,
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
            sendColorToServer(ws, strip.name, newColor);
            setCurrentColor(color);
            setNewColor(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newColor]);

    const stripRef = useRef<HTMLInputElement | null>(null);

    const colorString = `rgb(${color.red}, ${color.green}, ${color.blue})`;
    const actualColorString = `rgb(${strip.color.red}, ${strip.color.green}, ${strip.color.blue})`;

    const changeEffect = (effectName: effect["name"]) => {
        const effect = effects.find((e) => e.name === effectName);
        if (effect === undefined) sendColorToServer(ws, strip.name, color);
        else setLedEffect(ws, strip, effect);
    };

    useLedEffect(strip.effect, stripRef);

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
