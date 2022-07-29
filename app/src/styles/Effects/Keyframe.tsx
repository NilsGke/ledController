import { keyframe } from "../../../../src/effects";

type props = {
    frame: keyframe;
};
const Keyframe: React.FC<props> = ({ frame }) => {
    return <div className="keyframe">{frame.step}</div>;
};

export default Keyframe;
