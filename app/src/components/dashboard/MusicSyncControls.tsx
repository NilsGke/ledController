import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { infoData } from "../../connection/newData";
import { useState } from "react";
import { effect } from "../../../../src/effects";

import "../../styles/dashboard/musicSyncControls.sass";

type props = {
    data: infoData;
};

const MusicSyncControls: React.FC<props> = ({ data }) => {
    const { effects } = data;

    const [effect, setEffect] = useState<effect | null>(null);

    return (
        <div className="musicSyncControls">
            <div className="control">
                <FormControl sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel id="EffectInputForMusicSync">Effect</InputLabel>
                    <Select
                        labelId="EffectInputForMusicSync"
                        id="musicEffectSelect"
                        value={effect === null ? "" : effect.name}
                        label="Effect"
                        onChange={(e) => {
                            setEffect(
                                effects.find(
                                    (eff) =>
                                        eff.name === (e.target.value as string)
                                ) || null
                            );
                        }}
                    >
                        <MenuItem value={""}>-</MenuItem>
                        {effects.map((effect) => (
                            <MenuItem
                                key={effect.name + effect.id}
                                value={effect.name}
                            >
                                {effect.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
        </div>
    );
};

export default MusicSyncControls;
