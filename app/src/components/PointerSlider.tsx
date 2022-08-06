import Slider, { SliderThumb } from "@mui/material/Slider/Slider";
import { useEffect, useLayoutEffect, useState } from "react";
import { effect } from "../../../src/effects";
import "../styles/pointerSlider.sass";

type props = {
    effect: effect | null;
};

const PointerSlider: React.FC<props> = ({ effect }) => {
    const updateInterval = 100;

    const [value, setValue] = useState(0); // 0 - 1000
    const [update, setUpdate] = useState(false);

    useEffect(() => {
        if (effect === null) return;
        setUpdate(true);
    }, [effect]);

    useLayoutEffect(() => {
        if (effect === null || effect.time === undefined) return;

        const { duration, time } = effect;

        const timePassed = Date.now() - time;

        let timeInEffect = timePassed;
        while (timeInEffect >= duration) timeInEffect -= duration;

        const val = Math.round((1000 / duration) * timeInEffect);
        setValue(val);

        setTimeout(() => setUpdate(!update), updateInterval);
    }, [update]);

    return (
        <div
            className={
                "PointerSlider" + (effect === null ? " hidden" : " active")
            }
        >
            <Slider
                min={0}
                max={1000}
                aria-label={"pointer slider"}
                value={value}
                track={false}
            />
        </div>
    );
};

export default PointerSlider;
