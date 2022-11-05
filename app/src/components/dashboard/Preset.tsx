import { preset } from "../../../../src/presets/types";
import applyPreset from "../../connection/applyPreset";
import "../../styles/dashboard/preset.sass";
import DeleteIcon from "@mui/icons-material/Delete";
import ColorPresetChip from "../ColorPresetChip";
import { infoData } from "../../connection/newData";

type props = {
    ws: WebSocket;
    data: preset;
    active?: boolean;
    delete: () => void;
    effects: infoData["effects"];
};

const Preset: React.FC<props> = ({
    ws,
    data: preset,
    active,
    delete: deleteFun,
    effects,
}) => {
    return (
        <div className="presetContainer">
            <div
                className={"preset" + (active ? " active" : "")}
                onClick={() => {
                    applyPreset(ws, preset.id);
                }}
            >
                <h2>{preset.name}</h2>
                <button
                    className="delete"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteFun();
                    }}
                >
                    <DeleteIcon />
                </button>
                <div className="previewContainer">
                    {preset.strips.map((s) => (
                        <ColorPresetChip
                            key={s.id}
                            color={s.color}
                            effect={effects.find((e) => e.id === s.effectId)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Preset;
