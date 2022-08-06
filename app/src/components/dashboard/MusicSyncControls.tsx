import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { infoData } from "../../connection/newData";
import { ChangeEvent, useEffect, useState } from "react";
import { effect } from "../../../../src/effects";

import "../../styles/dashboard/musicSyncControls.sass";
import TextField from "@mui/material/TextField";
import { setLedEffect } from "../../connection/ledEffect";
import { returnTimeDifference } from "../../connection/timeDifference";
import FormControlLabel from "@mui/material/FormControlLabel";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";

type props = {
    data: infoData;
};

/**
 * music controls for led strip effects
 * pbm calculating functions from: https://codepen.io/Theavon/pen/dyYeVLY
 */
const MusicSyncControls: React.FC<props> = ({ data }) => {
    const { effects } = data;

    const [effect, setEffect] = useState<effect | null>(null);
    const [bpm, setBpm] = useState<number>(0);

    const [taps, setTaps] = useState<number[]>([]);

    // ms options to choose from
    const [option1, setOption1] = useState(0);
    const [option2, setOption2] = useState(0);
    const [option3, setOption3] = useState(0);

    const [selectedOption, setSelectedOption] = useState(0);

    useEffect(() => {
        const ms = 60000 / bpm;
        setOption1(Math.round(ms / 2));
        setOption2(Math.round(ms));
        setOption3(Math.round(ms * 2));
        setSelectedOption(Math.round(ms));
    }, [taps, bpm]);

    const tap = () => {
        const time = Date.now();
        const newTaps = taps.slice();

        // reset if no tap for two seconds
        if (newTaps[0] !== undefined && newTaps[0] - Date.now() > 2000)
            newTaps.length = 0;

        if (newTaps.length === 20) newTaps.shift();
        newTaps.push(time);
        setTaps(newTaps);
        calcBPM();
    };

    const precision = 5;

    const calcBPM = () => {
        let current_bpm = 0;
        let ticks = [];

        if (taps.length >= 2) {
            for (let i = 0; i < taps.length; i++) {
                if (i >= 1) {
                    // calc bpm between last two taps
                    ticks.push(
                        Math.round(
                            (60 / (taps[i] / 1000 - taps[i - 1] / 1000)) * 100
                        ) / 100
                    );
                }
            }
        }

        if (taps.length >= 24) {
            taps.shift();
        }

        if (ticks.length >= 2) {
            current_bpm = getAverage(ticks, precision);

            if (taps.length >= precision + 3) {
                if (current_bpm % 2 == 1)
                    current_bpm = getAverage(ticks, precision + 1);
                if (current_bpm % 2 == 1)
                    current_bpm = getAverage(ticks, precision + 2);
                if (current_bpm % 2 == 1)
                    current_bpm = getAverage(ticks, precision + 3);
            }

            if (bpm == 0 || bpm - current_bpm >= 10) {
                setBpm(Math.round(bpm));
            }

            setBpm(Math.round(current_bpm));
        }
    };

    function getAverage(Values: number[], Precision: number) {
        let ticks = Values;
        let n = 0;

        for (let i = ticks.length - 1; i >= 0; i--) {
            n += ticks[i];
            if (ticks.length - i >= Precision) break;
        }

        return n / precision;
    }

    const sync = () => {
        if (effect === undefined || data.strips.length === 0 || effect === null)
            return;

        setLedEffect(data.strips[0], {
            ...effect,
            time: Date.now() - returnTimeDifference(),
        });
    };

    return (
        <div className="musicSyncControlsContainer">
            <div className="musicSyncControls">
                <div className="field">
                    <FormControl sx={{ minWidth: 120 }}>
                        <InputLabel id="EffectInputForMusicSync">
                            Effect
                        </InputLabel>
                        <Select
                            labelId="EffectInputForMusicSync"
                            id="musicEffectSelect"
                            value={effect === null ? "" : effect.name}
                            label="Effect"
                            onChange={(e) => {
                                setEffect(
                                    effects.find(
                                        (eff) =>
                                            eff.name ===
                                            (e.target.value as string)
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
                <div className="field tapButton">
                    <button onKeyDown={tap} onMouseDown={tap}>
                        Tap
                    </button>
                </div>
                <div className="field bpmDisplay">
                    <TextField
                        className="bpmInputField"
                        type="number"
                        label="bpm"
                        value={bpm}
                        onChange={(ev: ChangeEvent) =>
                            setBpm(
                                parseInt(
                                    (ev.target as HTMLInputElement).value ||
                                        "100"
                                )
                            )
                        }
                    />
                </div>
                <div className="field tapButton">
                    <button onKeyDown={sync} onMouseDown={sync}>
                        Sync
                    </button>
                </div>
                <div className="field timeOptions">
                    <FormControlLabel
                        label=""
                        control={
                            <ToggleButtonGroup
                                value={selectedOption}
                                exclusive
                                onChange={(e, v) =>
                                    setSelectedOption(v || selectedOption)
                                }
                                aria-label="text alignment"
                            >
                                <ToggleButton
                                    value={option1}
                                    aria-label="timing option 1"
                                >
                                    {option1}
                                </ToggleButton>
                                <ToggleButton
                                    value={option2}
                                    aria-label="timing option 2"
                                >
                                    {option2}
                                </ToggleButton>
                                <ToggleButton
                                    value={option3}
                                    aria-label="timing option 3"
                                >
                                    {option3}
                                </ToggleButton>
                            </ToggleButtonGroup>
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default MusicSyncControls;
