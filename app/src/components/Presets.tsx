import React, { useState } from "react";
import addPreset from "../connection/addPreset";
import { infoData } from "../connection/newData";
import Preset from "./dashboard/Preset";
import { useAutoAnimate } from "@formkit/auto-animate/react";

type props = {
    data: infoData;
};
export const Presets: React.FC<props> = ({ data }) => {
    const [open, setOpen] = useState(false);

    const [container] = useAutoAnimate<HTMLDivElement>(/* optional config */);

    return (
        <div
            id="presetsContainer"
            ref={container}
            className={open ? "open" : "closed"}
        >
            <div className="button">
                <button onClick={() => setOpen(!open)}>
                    Presets{" "}
                    <div
                        className={"arrow " + (open ? "open" : "closed")}
                    ></div>
                </button>
            </div>
            {open ? (
                <>
                    {data.presets?.map((preset) => (
                        <Preset
                            active={preset.name === data.activePreset?.name}
                            key={preset.id}
                            data={preset}
                        />
                    ))}
                    <div className="presetContainer">
                        <div
                            className="preset"
                            onClick={() => {
                                const name = prompt(
                                    "enter preset name: ",
                                    `newPreset#${data.presets.length + 1}`
                                );
                                if (name === null) return;
                                let id = 0;
                                while (
                                    data.presets.map((p) => p.id).includes(id)
                                )
                                    id++;
                                addPreset({ name, id, strips: data.strips });
                            }}
                        >
                            <h2>+</h2>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};
