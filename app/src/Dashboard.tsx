import { green } from "@mui/material/colors";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Switch from "@mui/material/Switch/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { effect } from "../../src/effects/effect";
import { rgbStripType } from "../../src/ledStrip/types";
import { preset } from "../../src/presets/types";
import Preset from "./components/dashboard/Preset";
import DashboardStrip, { sliderTypes } from "./components/dashboard/Strip";
import "./styles/dashboard.sass";

type infoData = {
    strips: rgbStripType[];
    presets: preset[];
    effects: effect[];
};

const Dashboard: React.FC = () => {
    const [on, setOn] = useState(true);
    const [data, setData] = useState<null | infoData>(null);
    const [refresh, setRefresh] = useState<boolean>(false);

    const [sync, setSync] = useState<boolean>(false);
    const [fancySliders, setFancySliders] = useState(false);

    const [sliders, setSliders] = useState<sliderTypes>(
        (localStorage.getItem("ledControllerSliders") || "hue") as sliderTypes
    );

    // useEffect(() => {
    //     const interval = setInterval(() => setRefresh(true), 1000);
    //     return () => {
    //         clearInterval(interval);
    //     };
    // }, []);

    const rootRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (data === null || refresh === true)
            fetch("api/info")
                .then((res) => res.json())
                .then((data: infoData) => {
                    setData(data);
                    setRefresh(false);
                });
    }, [data, refresh]);

    const keyHandler = (e: Event) => {
        console.log(e);
    };

    useEffect(() => {
        if (rootRef.current)
            rootRef.current.addEventListener("keyDown", keyHandler);

        return () => {
            if (rootRef.current)
                rootRef.current.removeEventListener("keyDown", keyHandler);
        };
    }, []);

    if (data === null) return <div className="dashboard loading"></div>;

    const handleSyncChange = (e: any, value: string) => {
        console.log(value);
        setSync(!sync);
    };

    console.log(data);

    return (
        <div className="dashboard" ref={rootRef}>
            <div id="stripsContainer" className={on ? "on" : "off"}>
                {data.strips.map((strip) => (
                    <DashboardStrip
                        key={strip.name}
                        data={strip}
                        effects={data.effects}
                        refresh={() => setRefresh(true)}
                        sliderType={sliders}
                    />
                ))}
            </div>
            <div id="controls">
                <ThemeProvider
                    theme={createTheme({
                        palette: {
                            primary: {
                                main: "#2666ff",
                            },
                            success: {
                                main: "#61dd2e",
                            },
                        },
                    })}
                >
                    <div className="control" id="onOffToggle">
                        <FormControlLabel
                            value="onOff"
                            control={
                                <Switch
                                    color="success"
                                    aria-label="switch strips on / off"
                                    checked={on}
                                    onChange={(
                                        state: ChangeEvent<HTMLInputElement>
                                    ) => setOn(state.target.checked)}
                                />
                            }
                            label="onOff"
                            labelPlacement="start"
                        />
                    </div>
                    <div className="control" id="syncToggle">
                        <FormControlLabel
                            value="sync"
                            control={
                                <Switch
                                    color="primary"
                                    aria-label="sync strips"
                                />
                            }
                            label="Sync"
                            labelPlacement="start"
                        />
                    </div>
                    <div className="control" id="fancySliderContainer">
                        <FormControlLabel
                            label=""
                            control={
                                <ThemeProvider
                                    theme={createTheme({
                                        palette: {
                                            mode: "dark",
                                        },
                                    })}
                                >
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
                                </ThemeProvider>
                            }
                        ></FormControlLabel>
                    </div>
                </ThemeProvider>
            </div>
            <div id="presetsContainer">
                {data.presets?.map((preset) => (
                    <Preset
                        key={preset.id}
                        data={preset}
                        refresh={() => setRefresh(true)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
