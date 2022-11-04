import { effect, keyframe } from "../../../src/effects";

const useLedEffect = (effet: effect) => {
    
    const [color, setColor] = useState();

    useEffect(() => {
        const update = () => {
            
        }
        const interval = setInterval(update, refreshTime);
        return () => clearInterval(interval);
    }, [])

    return color;
}

export default useLedEffect;
