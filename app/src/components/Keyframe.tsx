import { keyframe } from "../../../src/effects";
import IconButton from "@mui/material/IconButton/IconButton";
import ArrowDropUpRoundedIcon from "@mui/icons-material/ArrowDropUpRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import { indexedKeyframe } from "../EditEffect";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

type props = {
    frame: indexedKeyframe;
    active: boolean;
    setActive: (id: indexedKeyframe["id"]) => void;
    move: (direction: -1 | 1) => void;
    changeStep: (value: number) => void;
    remove: (id: indexedKeyframe["id"]) => void;
    deletable: boolean;
};

const Keyframe: React.FC<props> = ({
    frame,
    move,
    changeStep,
    remove,
    active,
    setActive,
    deletable,
}) => {
    return (
        <div
            className={"keyframe" + (active ? " active" : "")}
            onClick={() => setActive(frame.id)}
        >
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
                <IconButton className="left" onClick={() => move(-1)}>
                    <ArrowDropUpRoundedIcon />
                </IconButton>
                <IconButton className="left" onClick={() => move(1)}>
                    <ArrowDropDownRoundedIcon />
                </IconButton>
            </div>
            <div
                className={"delete" + (deletable ? "" : " disabled")}
                onClick={() => deletable && remove(frame.id)}
            >
                <DeleteRoundedIcon />
            </div>
        </div>
    );
};

export default Keyframe;
