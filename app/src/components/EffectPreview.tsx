import { effect } from "../../../src/effects";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import IconButton from "@mui/material/IconButton/IconButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Stack from "@mui/material/Stack/Stack";
import ArrowLeftRoundedIcon from "@mui/icons-material/ArrowLeftRounded";
import ArrowRightRoundedIcon from "@mui/icons-material/ArrowRightRounded";
import moveEffect from "../connection/moveEffect";
import testEffect from "../connection/testEffect";
import useLedEffect from "../hooks/useLedEffect";
import { useRef } from "react";

type props = {
    effect: effect;
    ws: WebSocket;
    deleteEffect: () => void;
};

const EffectPreview: React.FC<props> = ({ effect, ws, deleteEffect }) => {
    const effectRef = useRef(null);
    useLedEffect(effect, effectRef);

    return (
        <div className="effect" key={effect.id} ref={effectRef}>
            <div className="header">
                <IconButton
                    className="left"
                    onClick={() => moveEffect(ws, effect.id, -1)}
                >
                    <ArrowLeftRoundedIcon />
                </IconButton>
                <h2>{effect.name}</h2>
                <IconButton
                    className="right"
                    onClick={() => moveEffect(ws, effect.id, 1)}
                >
                    <ArrowRightRoundedIcon />
                </IconButton>
            </div>
            <div className="buttons">
                <Stack direction="row" spacing={1}>
                    <IconButton
                        color="success"
                        onClick={() => testEffect(ws, effect)}
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
                    <IconButton color="error" onClick={() => deleteEffect()}>
                        <DeleteRoundedIcon color="error" />
                    </IconButton>
                </Stack>
            </div>
        </div>
    );
};

export default EffectPreview;
