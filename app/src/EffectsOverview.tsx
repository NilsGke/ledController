import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { Link } from "react-router-dom";
import "./styles/effectsOverview.sass";
import { useEffect, useRef, useState } from "react";
import { infoData, newDataEvent, requestNewData } from "./connection/newData";
import { wsEvents } from "./connection/messageEvent";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { effect } from "../../src/effects";

import autoAnimate from "@formkit/auto-animate";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { deleteEffect } from "./connection/ledEffect";
import ConfirmDialog from "./components/ConfirmDialog";
import EffectPreview from "./components/EffectPreview";

type props = {
    ws: WebSocket;
};

const EffectsOverview: React.FC<props> = ({ ws }) => {
    const [data, setData] = useState<null | infoData>(null);
    const [effects, setEffects] = useState<effect[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteEffectId, setDeleteEffectId] = useState<effect["id"]>(-1);

    const effectsRef = useRef<null | HTMLInputElement>(null);

    // request new data
    useEffect(() => requestNewData(ws), []);
    // receive new data
    useEffect(() => {
        const newDataHandler = (e: Event) => {
            console.log("newData: ", { e });
            setData((e as newDataEvent).detail.newData);
        };
        wsEvents.addEventListener("newData", newDataHandler);
        return () => wsEvents.removeEventListener("newData", newDataHandler);
    }, []);
    // handleNewData
    useEffect(() => {
        if (data === null) return;
        setEffects(data.effects);
    }, [data]);

    useEffect(() => {
        effectsRef.current && autoAnimate(effectsRef.current);
    }, [effectsRef]);

    return (
        <div id="app" className="effectsOverview">
            <div className="backButton">
                <Link to="/">
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
            <h1>Effects</h1>
            <div className="effectsContainer" ref={effectsRef}>
                {data === null ? (
                    <CircularProgress />
                ) : (
                    effects.map((effect) => (
                        <EffectPreview
                            effect={effect}
                            ws={ws}
                            deleteEffect={() => {
                                setDeleteEffectId(effect.id);
                                setDialogOpen(true);
                            }}
                        />
                    ))
                )}
                <div className="effect addEffect">
                    <Link to="/effects/new">
                        <AddRoundedIcon />
                    </Link>
                </div>
            </div>
            <ConfirmDialog
                open={dialogOpen}
                text={`are you sure you want to delete effect: "${
                    effects?.find((eff) => eff.id === deleteEffectId)?.name ||
                    ""
                }"`}
                close={() => setDialogOpen(false)}
                options={[
                    {
                        name: "keep",
                        default: true,
                        function: () => {
                            setDialogOpen(false);
                            setDeleteEffectId(-1);
                        },
                    },
                    {
                        name: "delete",
                        default: false,
                        function: () => {
                            setDialogOpen(false);
                            deleteEffect(ws, deleteEffectId);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default EffectsOverview;
