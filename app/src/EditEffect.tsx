import "./styles/editEffect.sass";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ws, { wsConnected, wsEvents } from "./connection/connection";
import { useEffect, useRef, useState } from "react";
import { infoData, newDataEvent, requestNewData } from "./connection/newData";
import CustomSlider from "./components/Slider";
import { effect, keyframe } from "../../src/effects";
import { sliderTypes } from "./components/dashboard/Strip";
import HuePicker from "./components/HuePicker";
import BrightnessPicker from "./components/BrightnessPicker";
import RgbPicker from "./components/RgbPicker";
import { ledValue, rgbStripType } from "../../src/ledStrip/types";
import Keyframe from "./components/Keyframe";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import testEffect from "./connection/testEffect";
// mui
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import ThemeProvider from "@mui/system/ThemeProvider/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton/ToggleButton";
import TextField from "@mui/material/TextField/TextField";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Button from "@mui/material/Button/Button";
import VerticalAlignCenterRoundedIcon from "@mui/icons-material/VerticalAlignCenterRounded";
import CalendarViewWeekRoundedIcon from "@mui/icons-material/CalendarViewWeekRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ButtonGroup from "@mui/material/ButtonGroup";
import Tooltip from "@mui/material/Tooltip/Tooltip";
import LinearProgress from "@mui/material/LinearProgress/LinearProgress";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SaveAsRoundedIcon from "@mui/icons-material/SaveAsRounded";
import { FormLabel } from "@mui/material";
import ConfirmDialog from "./components/ConfirmDialog";
import { addLedEffect, editLedEffect } from "./connection/ledEffect";

export interface indexedKeyframe extends keyframe {
    id: number;
}

const EditEffect = () => {
    let navigate = useNavigate();

    const [data, setData] = useState<null | infoData>(null);
    const [requestData, setRequestData] = useState(true);

    // try to find effect name in url to edit
    const effectName = decodeURI(useLocation().pathname.split("/")[2]);
    const editEffect: effect | null =
        data?.effects.find((effect) => effect.name === effectName) || null;

    const [sliders, setSliders] = useState<sliderTypes>(
        (localStorage.getItem("ledControllerSliders") || "hue") as sliderTypes
    );

    const [dialogOpen, setDialogOpen] = useState(false);

    const [setEditEffect, setSetEditEffect] = useState(false);

    const [name, setName] = useState("");
    const nameTaken =
        editEffect === null && data?.effects.map((e) => e.name).includes(name);
    const [duration, setDuration] = useState(5000);
    const [transition, setTransition] =
        useState<effect["transition"]>("linear");

    const defaultKeyframes: indexedKeyframe[] = [
        {
            step: 0,
            color: { red: 255, green: 0, blue: 0 },
            id: 0,
        },
        {
            step: 50,
            color: { red: 255, green: 0, blue: 255 },
            id: 1,
        },
        {
            step: 100,
            color: { red: 0, green: 0, blue: 255 },
            id: 2,
        },
    ];

    const [activeKeyframeId, setActiveKeyframeId] = useState(0);
    const [keyframes, setKeyframes] =
        useState<indexedKeyframe[]>(defaultKeyframes);

    const activeKeyframe = keyframes.find(
        (frame) => frame.id === activeKeyframeId
    );
    const [activeKeyframeColor, setActiveKeyframeColor] = useState<
        rgbStripType["color"] | null
    >(null);

    const sliderRef = useRef<null | HTMLElement>(null);

    // const keyframeList = useRef<HTMLElement | null>(null)
    const [keyframeList] =
        useAutoAnimate<HTMLDivElement>(/* optional config */);

    // sync the strips to all show the effect and set default color
    useEffect(() => {
        if (!requestData || !wsConnected) {
            setRequestData(false);
            setTimeout(() => setRequestData(true), 100);
            return;
        }
        requestNewData();
    }, [requestData]);
    // receive new data
    useEffect(() => {
        const newDataHandler = (e: Event) =>
            setData((e as newDataEvent).detail.newData);
        wsEvents.addEventListener("newData", newDataHandler);
        return () => wsEvents.removeEventListener("newData", newDataHandler);
    }, []);

    // change color on a keyframe
    useEffect(() => {
        if (activeKeyframeColor === null) return;
        const newKeyframes = keyframes;
        const index = keyframes.findIndex(
            (frame) => frame.id === activeKeyframeId
        );
        keyframes[index].color = activeKeyframeColor;
        setKeyframes(newKeyframes);
    }, [activeKeyframeColor]);

    // try to set edit effect
    useEffect(() => {
        if (data === null || setEditEffect) return; // effect already set or data not yet provided
        if (editEffect === null) return setSetEditEffect(true); // no effect found
        setDuration(editEffect.duration);
        setName(editEffect.name);
        const newKeyframes: indexedKeyframe[] = editEffect.keyframes.map(
            (frame, i) => ({
                ...frame,
                id: i,
            })
        );
        setKeyframes(newKeyframes.sort((a, b) => a.step - b.step));
        setSetEditEffect(true);
    }, [data]);

    const addKeyframe = () => {
        let biggestGapLow: indexedKeyframe = {
                id: -1,
                color: { red: 255, green: 0, blue: 0 },
                step: 0,
            },
            biggestGapHigh: indexedKeyframe = {
                id: -1,
                color: { red: 255, green: 0, blue: 0 },
                step: 100,
            },
            diff: number = 0;

        if (keyframes.length > 2)
            // find the biggest gap in the keyframes
            for (let i = 0; i < keyframes.length - 1; i++) {
                let newDiff = keyframes[i + 1].step - keyframes[i].step;
                if (newDiff >= diff) {
                    biggestGapLow = keyframes[i];
                    biggestGapHigh = keyframes[i + 1];
                    diff = newDiff;
                }
            }

        let newId = 0;
        while (keyframes.map((f) => f.id).includes(newId)) newId++;
        const newKeyframe: indexedKeyframe = {
            id: newId,
            step: Math.round(biggestGapLow.step + diff / 2),
            color: {
                // calculate the color between the two keyframes
                red: (biggestGapLow.color.red +
                    0.5 *
                        (biggestGapHigh.color.red -
                            biggestGapLow.color.red)) as ledValue,
                green: (biggestGapLow.color.green +
                    0.5 *
                        (biggestGapHigh.color.green -
                            biggestGapLow.color.green)) as ledValue,
                blue: (biggestGapLow.color.blue +
                    0.5 *
                        (biggestGapHigh.color.blue -
                            biggestGapLow.color.blue)) as ledValue,
            },
        };

        const newKeyframes: indexedKeyframe[] = keyframes.slice();
        newKeyframes.push(newKeyframe);
        setKeyframes(newKeyframes.sort((a, b) => a.step - b.step));
        setActiveKeyframeId(newKeyframe.id);
    };

    const saveEffect = () => {
        addLedEffect({
            keyframes: keyframes.slice().sort((a, b) => a.step - b.step),
            duration,
            id: -1,
            name: name.trim(),
            transition,
            time: undefined,
        } as effect);
        navigate("/effects");
    };

    const saveEditedEffect = () => {
        if (editEffect === null) return;
        editLedEffect({
            keyframes: keyframes.slice().sort((a, b) => a.step - b.step),
            duration,
            id: editEffect.id,
            name: name.trim(),
            transition,
            time: undefined,
        } as effect);
        navigate("/effects");
    };

    const createCopy = () => {
        let effName = name.trim();

        if (data?.effects.map((e) => e.name).includes(effName))
            effName = 'copy of "' + effName + '"';

        addLedEffect({
            keyframes: keyframes.slice().sort((a, b) => a.step - b.step),
            duration,
            id: -1,
            name: effName,
            transition,
            time: undefined,
        } as effect);
    };

    const error: boolean =
        isNaN(duration) || duration <= 0 || name.length === 0;

    return (
        <div id="app" className="effects">
            <div className="backButton">
                <Link
                    to="/"
                    onClick={(ev) =>
                        !window.confirm(
                            "Progress will be lost! Are you sure?"
                        ) && ev.preventDefault()
                    }
                >
                    <FormControlLabel
                        control={
                            <span>
                                <WestRoundedIcon /> Dashboard
                            </span>
                        }
                        label=""
                    />
                </Link>
            </div>
            <div id="timeLineContainer">
                <div id="timeLine">
                    {setEditEffect ? (
                        <CustomSlider
                            transition={transition}
                            keyframes={keyframes}
                            activeKeyframeId={activeKeyframeId}
                            changeActiveKeyframe={(id: indexedKeyframe["id"]) =>
                                setActiveKeyframeId(id)
                            }
                            onChange={(changedKeyframes: indexedKeyframe[]) =>
                                setKeyframes(changedKeyframes)
                            }
                            onChangeCommit={(
                                changedKeyframes: indexedKeyframe[]
                            ) =>
                                setKeyframes(
                                    changedKeyframes.sort(
                                        (a, b) => a.step - b.step
                                    )
                                )
                            }
                        />
                    ) : (
                        <>
                            <span>connecting...</span> <LinearProgress />
                        </>
                    )}
                </div>
            </div>
            <div id="controls">
                <div id="keyframeSettings">
                    <h2>Keyframe:</h2>
                    <div className="colorInput">
                        {sliders === "hue" ? (
                            <>
                                <HuePicker
                                    color={
                                        (activeKeyframe?.color || {
                                            red: 0,
                                            green: 0,
                                            blue: 0,
                                        }) as rgbStripType["color"]
                                    }
                                    onChange={(color) => {
                                        setActiveKeyframeColor(color);
                                    }}
                                    onChangeComplete={(color) => {
                                        setActiveKeyframeColor(color);
                                    }}
                                />
                                <BrightnessPicker
                                    color={
                                        (activeKeyframe?.color || {
                                            red: 0,
                                            green: 0,
                                            blue: 0,
                                        }) as rgbStripType["color"]
                                    }
                                    onChange={(color) => {
                                        setActiveKeyframeColor(color);
                                    }}
                                    onChangeComplete={(color) => {
                                        setActiveKeyframeColor(color);
                                    }}
                                />
                            </>
                        ) : (
                            <RgbPicker
                                color={
                                    (activeKeyframe?.color || {
                                        red: 0,
                                        green: 0,
                                        blue: 0,
                                    }) as rgbStripType["color"]
                                }
                                onChange={(color) => {
                                    setActiveKeyframeColor(color);
                                }}
                                onChangeComplete={(color) => {
                                    setActiveKeyframeColor(color);
                                }}
                                fancySliders={sliders}
                            />
                        )}
                    </div>
                </div>
                <div id="settings">
                    <ThemeProvider
                        theme={createTheme({
                            palette: {
                                mode: "dark",
                            },
                        })}
                    >
                        <div className="control" id="start">
                            <div className="label">
                                <Tooltip title="play effect">
                                    <Button
                                        variant="text"
                                        onClick={() =>
                                            testEffect({
                                                keyframes: keyframes
                                                    .slice()
                                                    .sort(
                                                        (a, b) =>
                                                            a.step - b.step
                                                    ),
                                                duration,
                                                id: -1,
                                                name: "test",
                                                transition,
                                                time: undefined,
                                            })
                                        }
                                    >
                                        <PlayArrowRoundedIcon />
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                        <div className="control" id="duration">
                            <div className="label">
                                <TextField
                                    value={duration}
                                    onChange={(ev) =>
                                        setDuration(parseInt(ev.target.value))
                                    }
                                    error={isNaN(duration) || duration <= 0}
                                    helperText={
                                        isNaN(duration)
                                            ? "required"
                                            : duration <= 0
                                            ? "duration > 0"
                                            : ""
                                    }
                                    id="outlined-basic"
                                    label="Duration (ms)"
                                    variant="outlined"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="control" id="name">
                            <div className="label">
                                <TextField
                                    value={name}
                                    error={nameTaken || name === ""}
                                    helperText={
                                        nameTaken ? "Name already taken" : ""
                                    }
                                    onChange={(ev) => {
                                        const re = /([a-z0-9ßöäü\s]+)/gi;
                                        setName(
                                            (
                                                ev.target.value.match(re) || []
                                            ).join("")
                                        );
                                    }}
                                    id="outlined-basic"
                                    label="Name"
                                    variant="outlined"
                                />
                            </div>
                        </div>
                        <div className="control" id="group">
                            <div className="label">
                                <ButtonGroup
                                    variant="outlined"
                                    aria-label="outlined primary button group"
                                >
                                    <Tooltip title="add new keyframe">
                                        <Button onClick={() => addKeyframe()}>
                                            <AddRoundedIcon />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="center keyframe">
                                        <Button
                                            id="centerKeyframe"
                                            onClick={() => {
                                                const newKeyframes =
                                                    keyframes.slice();
                                                const index =
                                                    newKeyframes.findIndex(
                                                        (frame) =>
                                                            frame.id ===
                                                            activeKeyframeId
                                                    );

                                                if (
                                                    index === 0 ||
                                                    index ===
                                                        newKeyframes.length
                                                )
                                                    return;

                                                newKeyframes[index].step =
                                                    Math.round(
                                                        newKeyframes[index - 1]
                                                            .step +
                                                            (newKeyframes[
                                                                index + 1
                                                            ].step -
                                                                newKeyframes[
                                                                    index - 1
                                                                ].step) /
                                                                2
                                                    );

                                                setKeyframes(newKeyframes);
                                            }}
                                        >
                                            <VerticalAlignCenterRoundedIcon />
                                        </Button>
                                    </Tooltip>
                                    <Tooltip title="spread keyframes evenly">
                                        <Button
                                            onClick={() => {
                                                const newKeyframes: indexedKeyframe[] =
                                                    keyframes
                                                        .slice()
                                                        .map((frame, i) => ({
                                                            ...frame,
                                                            step: Math.round(
                                                                (100 /
                                                                    (keyframes.length -
                                                                        1)) *
                                                                    i
                                                            ),
                                                        }));
                                                setKeyframes(newKeyframes);
                                            }}
                                        >
                                            <CalendarViewWeekRoundedIcon />
                                        </Button>
                                    </Tooltip>
                                </ButtonGroup>
                            </div>
                        </div>
                        <div className="control" id="transitionToggle">
                            <div className="label">
                                <ToggleButtonGroup
                                    value={transition}
                                    exclusive
                                    onChange={(e, v: effect["transition"]) =>
                                        v != null &&
                                        setTransition(v || transition)
                                    }
                                    aria-label="text alignment"
                                >
                                    <ToggleButton
                                        value="none"
                                        aria-label="no transition"
                                    >
                                        none
                                    </ToggleButton>
                                    <ToggleButton
                                        value="linear"
                                        aria-label="linear transition"
                                    >
                                        linear
                                    </ToggleButton>
                                    <ToggleButton
                                        value="function"
                                        disabled
                                        aria-label="function transition"
                                    >
                                        function
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </div>
                        </div>
                        <div className="control" id="fancySliderContainer">
                            <FormControlLabel
                                label=""
                                control={
                                    <ToggleButtonGroup
                                        value={sliders}
                                        exclusive
                                        onChange={(e, v) =>
                                            setSliders(v || sliders)
                                        }
                                        aria-label="text alignment"
                                    >
                                        <ToggleButton
                                            value="hue"
                                            aria-label="left aligned"
                                        >
                                            hue
                                        </ToggleButton>
                                        <ToggleButton
                                            value="rbg"
                                            aria-label="centered"
                                        >
                                            rgb
                                        </ToggleButton>
                                        <ToggleButton
                                            value="fancyRgb"
                                            aria-label="right aligned"
                                        >
                                            fancyRgb
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                }
                            ></FormControlLabel>
                        </div>
                        <div
                            className={"control" + (error ? " disabled" : "")}
                            id="save"
                        >
                            <div className="label">
                                <Tooltip
                                    title={
                                        editEffect === null
                                            ? "save"
                                            : "save edited effect"
                                    }
                                >
                                    <Button
                                        onClick={() => {
                                            if (editEffect === null)
                                                saveEffect();
                                            else setDialogOpen(true);
                                        }}
                                    >
                                        {editEffect === null ? (
                                            <SaveRoundedIcon />
                                        ) : (
                                            <SaveAsRoundedIcon />
                                        )}
                                    </Button>
                                </Tooltip>
                            </div>
                        </div>
                    </ThemeProvider>
                </div>
                <div id="keyframes" ref={keyframeList}>
                    {keyframes
                        .slice()
                        .sort((a, b) => a.step - b.step)
                        .map((frame, i) => (
                            <Keyframe
                                key={frame.id}
                                frame={frame}
                                active={activeKeyframeId === frame.id}
                                deletable={keyframes.length > 1}
                                setActive={(id: indexedKeyframe["id"]) =>
                                    setActiveKeyframeId(id)
                                }
                                move={(direction: -1 | 1) => {
                                    const newKeyframes = keyframes.slice();
                                    setActiveKeyframeId(newKeyframes[i].id);
                                    //FIXME: change does not apply instantly if keyframe is active but only if active is set to other keyframe
                                    const temp =
                                        newKeyframes[i + direction].step;
                                    newKeyframes[i + direction].step =
                                        newKeyframes[i].step;
                                    newKeyframes[i].step = temp;
                                    setKeyframes(
                                        keyframes.sort(
                                            (a, b) => a.step - b.step
                                        )
                                    );
                                }}
                                changeStep={(value: number) => {
                                    if (value < 0 || value > 100) return;
                                    keyframes[i].step = value;
                                    setKeyframes(
                                        keyframes.sort(
                                            (a, b) => a.step - b.step
                                        )
                                    );
                                }}
                                remove={(id: indexedKeyframe["id"]) => {
                                    const newKeyframes = keyframes.slice();
                                    newKeyframes.splice(
                                        newKeyframes.findIndex(
                                            (frame) => frame.id === id
                                        ),
                                        1
                                    );
                                    setKeyframes(newKeyframes);
                                }}
                            />
                        ))}
                </div>
            </div>
            <ConfirmDialog
                text="This will overwrite the old effect"
                close={() => setDialogOpen(false)}
                open={dialogOpen}
                options={[
                    {
                        name: "cancel",
                        function: () => {
                            setDialogOpen(false);
                        },
                    },
                    {
                        name: "create copy",
                        function: () => {
                            setDialogOpen(false);
                            createCopy();
                        },
                    },
                    {
                        name: "save",
                        function: () => {
                            setDialogOpen(false);
                            saveEditedEffect();
                        },
                    },
                ]}
            />
        </div>
    );
};

export default EditEffect;
