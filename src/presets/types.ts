import { effect } from "../effects";
import { rgbStripType } from "../ledStrip/types";

type stripPreset = {
    id: rgbStripType["id"];
    color: rgbStripType["color"];
    effectId?: effect["id"];
    effectTime?: effect["time"];
};

export type preset = {
    name: string;
    id: number;
    strips: stripPreset[];
};
