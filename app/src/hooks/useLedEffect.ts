import { effect, keyframe } from "../../../src/effects";

const useLedEffect = (effet: effect) => {
    const [color, setColor] = useState();

    useEffect(() => {
        const update = () => {
            if (strip.effect.time === undefined) strip.effect.time = Date.now(); // this should never happen but just in case and for the compiler its there

            const { duration, time, keyframes, transition } = effect;

            const timePassed = Date.now() + returnTimeDifference() - time;

            let timeInEffect = timePassed;
            while (timeInEffect >= duration) timeInEffect -= duration;

            let prev: keyframe | undefined, next: keyframe | undefined;

            let timeInTransition = timeInEffect;

            for (let i = 0; i < keyframes.length - 1; i++) {
                if (
                    (duration / 100) * keyframes[i].step <= timeInEffect &&
                    timeInEffect <= (duration / 100) * keyframes[i + 1].step
                ) {
                    // current transition
                    prev = keyframes[i];
                    next = keyframes[i + 1];
                    break;
                } else {
                    // previous transition
                    timeInTransition -=
                        (duration / 100) * keyframes[i + 1].step -
                        (duration / 100) * keyframes[i].step;
                }
            }

            if (prev !== undefined && next !== undefined) {
                const transTime =
                    (duration / 100) * next.step - (duration / 100) * prev.step;

                let percentTransPassed: number = 0;
                if (transition === "linear")
                    percentTransPassed = Math.round(
                        (100 / transTime) * timeInTransition
                    );
                else if (transition === "none") percentTransPassed = 0;

                const colorDiff = {
                    red: Math.round(prev.color.red - next.color.red),
                    green: Math.round(prev.color.green - next.color.green),
                    blue: Math.round(prev.color.blue - next.color.blue),
                };

                const addColor = {
                    red: Math.round((colorDiff.red * percentTransPassed) / 100),
                    green: Math.round(
                        (colorDiff.green * percentTransPassed) / 100
                    ),
                    blue: Math.round(
                        (colorDiff.blue * percentTransPassed) / 100
                    ),
                };

                const newColor = {
                    red: (prev.color.red - addColor.red) as ledValue,
                    green: (prev.color.green - addColor.green) as ledValue,
                    blue: (prev.color.blue - addColor.blue) as ledValue,
                };

                // just to make sure the colors are not above 255
                newColor.red = newColor.red > 255 ? 255 : newColor.red;
                newColor.green = newColor.green > 255 ? 255 : newColor.green;
                newColor.blue = newColor.blue > 255 ? 255 : newColor.blue;

                console.log(
                    `%c ${newColor.red} ${newColor.green} ${
                        newColor.blue
                    } ${Date.now()}`,
                    `background: rgb(${newColor.red}, ${newColor.green}, ${newColor.blue})`
                );

                // IDEA: add cubic function to make transitions more interesting
                // https://blog.maximeheckel.com/posts/cubic-bezier-from-math-to-motion/
                // there could be a function for inbetween keyframes and one for the entire transition

                const colorString: string = `rgb(${newColor.red}, ${newColor.green}, ${newColor.blue})`;

                setColor(newColor);

                // TODO: fix this hook (cannot see errors on ipad) and implement it on strip, test effect and now also on the presets
            }
        };
        const interval = setInterval(update, refreshTime);
        return () => clearInterval(interval);
    }, []);

    return color;
};

export default useLedEffect;
