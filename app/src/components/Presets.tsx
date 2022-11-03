import React, { useState } from "react";
import { addPreset, deletePreset } from "../connection/presets";
import { infoData } from "../connection/newData";
import Preset from "./dashboard/Preset";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import ConfirmDialog from "./ConfirmDialog";
import { preset } from "../../../src/presets/types";

type props = {
    data: infoData;
    ws: WebSocket;
};
export const Presets: React.FC<props> = ({ data, ws }) => {
    const [open, setOpen] = useState(false);

    const [container] = useAutoAnimate<HTMLDivElement>(/* optional config */);

    const [deletePresetId, setDeletePresetId] = useState<preset["id"]>(-1);
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

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
                            ws={ws}
                            active={preset.id === data.activePreset?.id}
                            key={preset.id}
                            data={preset}
                            delete={() => {
                                setDeletePresetId(preset.id);
                                setDialogOpen(true);
                            }}
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
                                addPreset(ws, {
                                    name,
                                    id,
                                    strips: data.strips,
                                });
                            }}
                        >
                            <h2>+</h2>
                        </div>
                    </div>
                </>
            ) : null}
            <ConfirmDialog
                open={dialogOpen}
                text={`are you sure you want to delete the preset: "${
                    data.presets?.find((ps) => ps.id === deletePresetId)
                        ?.name || ""
                }"`}
                close={() => setDialogOpen(false)}
                options={[
                    {
                        name: "keep",
                        default: true,
                        function: () => {
                            setDialogOpen(false);
                            setDeletePresetId(-1);
                        },
                    },
                    {
                        name: "delete",
                        default: false,
                        function: () => {
                            setDialogOpen(false);
                            deletePreset(ws, deletePresetId);
                        },
                    },
                ]}
            />
        </div>
    );
};
