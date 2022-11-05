import { useRef } from "react";
import { effect } from "../../../src/effects";
import { rgbStripType } from "../../../src/ledStrip/types";
import useLedEffect from "../hooks/useLedEffect";

type props = {
    color?: rgbStripType["color"];
    effect?: effect;
};

const ColorPresetChip: React.FC<props> = ({ color, effect }) => {
    const chipRef = useRef<HTMLDivElement | null>(null);
    const effectColor = useLedEffect(effect || null);

    return (
        <div
            className="colorChip"
            ref={chipRef}
            style={{
                background: effectColor
                    ? effectColor.colorString
                    : `rgb(${color?.red}, ${color?.green}, ${color?.blue})`,
            }}
        ></div>
    );
};

export default ColorPresetChip;
