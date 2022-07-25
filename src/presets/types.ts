import { effect } from "../effects/effect";
import { rgbStripType } from "../ledStrip/types";

type stripPreset = {
    id: rgbStripType["id"];
    color: rgbStripType["color"];
    effect: effect | null;
};

export type preset = {
    name: string;
    id: number;
    strips: stripPreset[];
};