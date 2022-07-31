import { keyframe } from "../../../src/effects";
import Input from "@mui/material/Input";
import TextField from "@mui/material/TextField/TextField";
import { useEffect, useState } from "react";
import IconButton from "@mui/material/IconButton/IconButton";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";

type props = {
    frame: keyframe;
    move: (direction: -1 | 1) => void;
    changeStep: (value: number) => void;
};
const Keyframe: React.FC<props> = ({ frame, move, changeStep }) => {
    return (
        <div className="keyframe">
            <div className="stepInput">
                <input
                    type="number"
                    name="stepInput"
                    id="stepInput"
                    value={frame.step}
                    onChange={(ev) => changeStep(parseInt(ev.target.value))}
                    onBlur={(ev) => changeStep(parseInt(ev.target.value))}
                    onKeyDown={(ev) => {
                        if (ev.key === "Enter") {
                            changeStep(
                                parseInt((ev.target as HTMLInputElement).value)
                            );
                            (ev.target as HTMLElement).blur();
                        }
                    }}
                />
            </div>
            <div
                className="color"
                style={{
                    background: `rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue})`,
                }}
            ></div>
            <div className="arrows">
                <IconButton className="left" onClick={() => -1}>
                    <ArrowDropUpRoundedIcon />
                </IconButton>
                <IconButton className="left" onClick={() => 1}>
                    <ArrowDropDownRoundedIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default Keyframe;
