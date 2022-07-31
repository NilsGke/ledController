import { ChangeEvent, useEffect, useRef, useState } from "react";
import DashboardStrip, { sliderTypes } from "./components/dashboard/Strip";
import { Presets } from "./components/Presets";
import ws from "./connection/connection";
import { infoData, newDataEvent, requestNewData } from "./connection/newData";
import setOnOff from "./connection/onOff";
import setStripSync from "./connection/sync";
import "./styles/dashboard/dashboard.sass";

// mui
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Switch from "@mui/material/Switch/Switch";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup/ToggleButtonGroup";
import { Link } from "react-router-dom";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

const Dashboard: React.FC = () => {
    const [on, setOn] = useState(true);
    const [data, setData] = useState<null | infoData>(null);
    const [refresh, setRefresh] = useState<boolean>(false);

    const [sync, setSync] = useState<boolean>(false);

    const [sliders, setSliders] = useState<sliderTypes>(
        (localStorage.getItem("ledControllerSliders") || "hue") as sliderTypes
    );

    const rootRef = useRef<HTMLInputElement | null>(null);

    // request new data
    useEffect(() => {
        if (data === null || refresh) requestNewData();
    }, [data, refresh]);

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
        setOn(data.onOff === "on");
        setSync(data.sync);
    }, [data]);

    // keypress handler
    useEffect(() => {
        const keyHandler = (e: Event) => {
            console.log(e);
        };

        if (rootRef.current)
            rootRef.current.addEventListener("keyDown", keyHandler);

        return () => {
            if (rootRef.current)
                rootRef.current.removeEventListener("keyDown", keyHandler);
        };
    }, []);

    // store slider position in local storage
    useEffect(() => {
        localStorage.setItem("ledControllerSliders", sliders);
    }, [sliders]);

    // on off change
    useEffect(() => {
        if ((data?.onOff === "on") !== on) setOnOff(on ? "on" : "off");
    }, [on]);

    // sync change
    useEffect(() => {
        if (data?.sync !== undefined)
            if (data?.sync !== sync) setStripSync(sync);
    }, [sync]);

    // render loading if no data there
    if (data === null)
        return (
            <div className="dashboard loading">
                <CircularProgress />
            </div>
        );

    return (
        <div id="app" className="dashboard">
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
                                        checked={sync}
                                        onChange={(e, checked) =>
                                            setSync(checked)
                                        }
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
                        <div className="control" id="effects">
                            <Link to={"/effects"}>
                                <FormControlLabel
                                    label=""
                                    control={
                                        <span>
                                            Effects <EastRoundedIcon />
                                        </span>
                                    }
                                ></FormControlLabel>
                            </Link>
                        </div>
                    </ThemeProvider>
                </div>
                <Presets data={data} />
            </div>
        </div>
    );
};

export default Dashboard;
