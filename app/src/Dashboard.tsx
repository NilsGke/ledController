import { useEffect, useState } from "react";
import { effect } from "../../src/effects/effect";
import { rgbStripType } from "../../src/ledStrip/types";
import { preset } from "../../src/presets/types";
import Preset from "./components/dashboard/Preset";
import DashboardStrip from "./components/dashboard/Strip";
import "./styles/dashboard.sass";

type infoData = {
    strips: rgbStripType[];
    presets: preset[];
    effects: effect[];
};

const Dashboard: React.FC = () => {
    const [data, setData] = useState<null | infoData>(null);
    const [refresh, setRefresh] = useState<boolean>(false);

    // useEffect(() => {
    //     const interval = setInterval(() => setRefresh(true), 1000);
    //     return () => {
    //         clearInterval(interval);
    //     };
    // }, []);

    useEffect(() => {
        if (data === null || refresh === true)
            fetch("api/info")
                .then((res) => res.json())
                .then((data: infoData) => {
                    setData(data);
                    setRefresh(false);
                });
    }, [data, refresh]);

    if (data === null) return <div className="dashboard loading"></div>;

    console.log(data);

    return (
        <div className="dashboard">
            <div id="stripsContainer">
                {data.strips.map((strip) => (
                    <DashboardStrip
                        key={strip.name}
                        data={strip}
                        effects={data.effects}
                        refresh={() => setRefresh(true)}
                    />
                ))}
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
