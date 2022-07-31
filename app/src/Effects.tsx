import "./styles/Effects/effects.sass";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { Link, useLocation } from "react-router-dom";
import ws from "./connection/connection";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { infoData, newDataEvent, requestNewData } from "./connection/newData";
import setStripSync from "./connection/sync";
import sendColorToServer from "./connection/setColor";
import ThemeProvider from "@mui/system/ThemeProvider/ThemeProvider";
import createTheme from "@mui/material/styles/createTheme";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import { effect, keyframe } from "../../src/effects";
import ToggleButton from "@mui/material/ToggleButton/ToggleButton";
import Slider, { SliderThumb } from "@mui/material/Slider/Slider";
import { sliderTypes } from "./components/dashboard/Strip";
import HuePicker from "./components/HuePicker";
import BrightnessPicker from "./components/BrightnessPicker";
import RgbPicker from "./components/RgbPicker";
import { rgbStripType } from "../../src/ledStrip/types";
import TextField from "@mui/material/TextField/TextField";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import Button from "@mui/material/Button/Button";
import Keyframe from "./components/Keyframe";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import testEffect from "./connection/testEffect";

interface indexedKeyframe extends keyframe {
    id: number;
}

const EffectsPage = () => {
    const [data, setData] = useState<null | infoData>(null);

    // try to find effect name in url to edit
    const effectName = decodeURI(useLocation().pathname.split("/")[2]);
    console.log(effectName);
    const editEffect: effect | null =
        data?.effects.find((effect) => effect.name === effectName) || null;
    console.log(editEffect);

    const [sliders, setSliders] = useState<sliderTypes>(
        (localStorage.getItem("ledControllerSliders") || "hue") as sliderTypes
    );

    const [setEditEffect, setSetEditEffect] = useState(false);

    const [name, setName] = useState("");
    const [duration, setDuration] = useState(5);
    const [transition, setTransition] =
        useState<effect["transition"]>("linear");

    const defaultKeyframes: indexedKeyframe[] = [
        {
            step: 0,
            color: { red: 255, green: 0, blue: 0 },
            id: 0,
        },
        {
            step: 40,
            color: { red: 0, green: 255, blue: 0 },
            id: 1,
        },
        {
            step: 100,
            color: { red: 0, green: 0, blue: 255 },
            id: 2,
        },
    ];

    const [activeKeyframeNumber, setActiveKeyframeNumber] = useState(0);
    const [keyframes, setKeyframes] =
        useState<indexedKeyframe[]>(defaultKeyframes);

    const activeKeyframe = keyframes[activeKeyframeNumber];
    const [activeKeyframeColor, setActiveKeyframeColor] = useState<
        rgbStripType["color"] | null
    >(null);

    const sliderRef = useRef<null | HTMLElement>(null);

    // const keyframeList = useRef<HTMLElement | null>(null)
    const [keyframeList] =
        useAutoAnimate<HTMLDivElement>(/* optional config */);

    // sync the strips to all show the effect and set default color
    useEffect(() => {
        requestNewData();
    }, []);
    // receive new data
    useEffect(() => {
        const newDataHandler = (e: Event) =>
            setData((e as newDataEvent).detail.newData);
        ws.addEventListener("newData", newDataHandler);
        return () => ws.removeEventListener("newData", newDataHandler);
    }, []);
    // handleNewData
    useEffect(() => {
        console.log(data);
        if (data === null) return;
    }, [data]);

    // apply colors to slider
    useEffect(() => {
        if (!sliderRef?.current) return;
        (
            sliderRef.current.getElementsByClassName(
                "MuiSlider-rail"
            )[0] as HTMLElement
        ).style.background = `white linear-gradient(to right, ${keyframes.map(
            (frame) =>
                ` rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue}) ${frame.step}%`
        )})`;
    });

    // change color on a keyframe
    useEffect(() => {
        if (activeKeyframeColor === null) return;
        const newKeyframes = keyframes;
        keyframes[activeKeyframeNumber].color = activeKeyframeColor;
        setKeyframes(newKeyframes);
    }, [activeKeyframeColor]);

    // try to set edit effect
    useEffect(() => {
        if (data === null || setEditEffect || editEffect === null) return;
        setDuration(editEffect.duration);
        setName(editEffect.name);
        const newKeyframes: indexedKeyframe[] = editEffect.keyframes.map(
            (frame, i) => ({
                ...frame,
                id: i,
            })
        );
        setKeyframes(newKeyframes);
        setSetEditEffect(true);
    }, [data]);

    const handleSliderChange = (
        event: React.SyntheticEvent | Event,
        value: number | number[],
        activeThumb: number
    ) => {
        setActiveKeyframeNumber(activeThumb);
        setActiveKeyframeColor(keyframes[activeThumb].color);
        const steps: number[] = value as number[];
        const newKeyframes: indexedKeyframe[] = keyframes.map((frame, i) => ({
            ...frame,
            step: steps[i],
        }));
        setKeyframes(newKeyframes);
    };

    interface KeyFrameThumbProps extends React.HTMLAttributes<unknown> {
        "data-index": number;
    }

    const KeyFrameThumb = (props: KeyFrameThumbProps) => {
        const { children, ...other } = props;
        return (
            <SliderThumb
                {...other}
                className={
                    "MuiSlider-thumb" +
                    (props["data-index"] === activeKeyframeNumber
                        ? " active"
                        : "")
                }
            >
                {children}
            </SliderThumb>
        );
    };

    console.log("%crerender effects", "background: lime");

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
                    <Slider
                        onChange={handleSliderChange}
                        ref={sliderRef}
                        components={{
                            Thumb: KeyFrameThumb,
                        }}
                        defaultValue={defaultKeyframes.map((k) => k.step)}
                        value={keyframes.map((k) => k.step)}
                        marks={[...new Array(11)].map((d, i) => ({
                            value: i * 10,
                        }))}
                        valueLabelDisplay="auto"
                        track={false}
                        min={0}
                        max={100}
                    />
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
                                        activeKeyframe.color as rgbStripType["color"]
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
                                        activeKeyframe.color as rgbStripType["color"]
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
                                    activeKeyframe.color as rgbStripType["color"]
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
                                <Button
                                    variant="text"
                                    onClick={() =>
                                        testEffect({
                                            keyframes,
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
                            </div>
                        </div>
                        <div className="control" id="duration">
                            <div className="label">
                                <TextField
                                    value={duration}
                                    onChange={(ev) =>
                                        setDuration(parseInt(ev.target.value))
                                    }
                                    id="outlined-basic"
                                    label="Duration"
                                    variant="outlined"
                                    type="number"
                                />
                            </div>
                        </div>
                        <div className="control" id="name">
                            <div className="label">
                                <TextField
                                    value={name}
                                    onChange={(ev) => setName(ev.target.value)}
                                    id="outlined-basic"
                                    label="Name"
                                    variant="outlined"
                                />
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
                    </ThemeProvider>
                </div>
                <div id="keyframes" ref={keyframeList}>
                    {keyframes
                        .sort((a, b) => a.step - b.step)
                        .map((frame, i) => (
                            <Keyframe
                                key={frame.id}
                                move={(direction: -1 | 1) => {
                                    const temp = keyframes[i + direction];
                                    keyframes[i + direction] = keyframes[i];
                                    keyframes[i] = temp;
                                    setKeyframes(keyframes);
                                }}
                                changeStep={(value: number) => {
                                    if (value < 0 || value > 100) return;
                                    keyframes[i].step = value;
                                    setKeyframes(keyframes);
                                }}
                                frame={frame}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
};

export default EffectsPage;
