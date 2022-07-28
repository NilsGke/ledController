import React from "react";
import addPreset from "../connection/addPreset";
import { infoData } from "../connection/newData";
import Preset from "./dashboard/Preset";
import { useAutoAnimate } from '@formkit/auto-animate/react'


type props = {
    data: infoData
}
export const Presets: React.FC<props> = ({
    data
}) => {

    const [container] = useAutoAnimate<HTMLDivElement>(/* optional config */)

    return <div id="presetsContainer" ref={container}>
        {data.presets?.map(preset => <Preset active={preset.name === data.activePreset?.name} key={preset.id} data={preset} />)}
        <div className="presetContainer">
            <div
                className="preset"
                onClick={() => {
                    const name = prompt("enter preset name: ", `newPreset#${data.presets.length + 1}`)
                    if (name === null) return;
                    let id = 0;
                    while (data.presets.map(p => p.id).includes(id)) id++;
                    addPreset({ name, id, strips: data.strips })
                }}
            >
                <h2>+</h2>
            </div>
        </div>
    </div>;
}
