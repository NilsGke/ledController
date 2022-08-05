import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import WestRoundedIcon from "@mui/icons-material/WestRounded";
import { Link } from "react-router-dom";
import "./styles/effectsOverview.sass";
import { useEffect, useRef, useState } from "react";
import { infoData, newDataEvent, requestNewData } from "./connection/newData";
import ws, { wsEvents } from "./connection/connection";
import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { effect, keyframe } from "../../src/effects";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton/IconButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Stack from "@mui/material/Stack/Stack";
import ArrowLeftRoundedIcon from "@mui/icons-material/ArrowLeftRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import moveEffect from "./connection/moveEffect";
import autoAnimate from "@formkit/auto-animate";
import testEffect from "./connection/testEffect";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { deleteEffect } from "./connection/ledEffect";
import ConfirmDialog from "./components/ConfirmDialog";

const EffectsOverview = () => {
    const [data, setData] = useState<null | infoData>(null);
    const [effects, setEffects] = useState<effect[]>([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteEffectId, setDeleteEffectId] = useState<effect["id"]>(-1);

    const effectsRef = useRef<null | HTMLInputElement>(null);

    // request new data
    useEffect(() => requestNewData(), []);
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
    // apply animations on effects change
    useEffect(() => {
        if (effectsRef === null || effectsRef.current === null) return;

        const elements = Array.from(
            effectsRef.current.getElementsByClassName("effect")
        );

        elements.forEach((element, i) => {
            console.log(element);
            if (effects[i] !== undefined) {
                const animationKeyframes = effects[i].keyframes.map(
                    (frame) => ({
                        boxShadow: `0px 0px 40px 0px rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue})`,
                        offset: frame.step / 100,
                    })
                );
                const animationTiming = {
                    duration: effects[i].duration,
                    iterations: Infinity,
                };
                element.animate(animationKeyframes, animationTiming);
            }
        });
    }, [effects]);

    useEffect(() => {
        if (effectsRef === null || effectsRef.current === undefined) return;

        return () => {};
    }, []);

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
                        <div className="effect" key={effect.id}>
                            <div className="header">
                                <IconButton
                                    className="left"
                                    onClick={() => moveEffect(effect.id, -1)}
                                >
                                    <ArrowLeftRoundedIcon />
                                </IconButton>
                                <h2>{effect.name}</h2>
                                <IconButton
                                    className="right"
                                    onClick={() => moveEffect(effect.id, 1)}
                                >
                                    <ArrowRightRoundedIcon />
                                </IconButton>
                            </div>
                            <div className="buttons">
                                <Stack direction="row" spacing={1}>
                                    <IconButton
                                        color="success"
                                        onClick={() => testEffect(effect)}
                                    >
                                        <PlayArrowRoundedIcon color="success" />
                                    </IconButton>
                                    <IconButton>
                                        <ContentCopyRoundedIcon />
                                    </IconButton>
                                    <IconButton
                                        color="warning"
                                        href={"/effects/" + effect.name}
                                    >
                                        <EditRoundedIcon color="warning" />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            setDeleteEffectId(effect.id);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <DeleteRoundedIcon color="error" />
                                    </IconButton>
                                </Stack>
                            </div>
                        </div>
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
                        function: () => {
                            setDialogOpen(false);
                            setDeleteEffectId(-1);
                        },
                    },
                    {
                        name: "delete",
                        function: () => {
                            setDialogOpen(false);
                            deleteEffect(deleteEffectId);
                        },
                    },
                ]}
            />
        </div>
    );
};

export default EffectsOverview;
