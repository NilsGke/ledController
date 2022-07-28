import { rgbStripType } from "../../../../src/ledStrip/types";
import { preset } from "../../../../src/presets/types";
import applyPreset from "../../connection/applyPreset";
import "../../styles/dashboard/preset.sass";

type props = {
    data: preset;
    active?: boolean
};

const Preset: React.FC<props> = ({ data: preset, active }) => {


    return (
        <div className="presetContainer">
            <div
                className={"preset" + (active ? " active" : "")}
                onClick={() => {
                    applyPreset(preset.name)
                }}
            >
                <h2>{preset.name}</h2>
                <div className="previewContainer">
                    <div
                        className="preview"
                        style={{
                            background: generateGradient(
                                preset.strips.map((s) => s.color)
                            ),
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Preset;

const generateGradient = (colors: rgbStripType["color"][]) => {
    var background = "linear-gradient(to right";

    const hexColors = colors.map((c) => rgbToHex(c));

    for (let i = 0; i < hexColors.length - 1; i++) {
        background += `, ${hexColors[i]} ${(100 / hexColors.length) * (i + 1)
            }%, ${hexColors[i + 1]} ${(100 / colors.length) * i + 1}%`;
    }

    return background + ")";
};

const rgbToHex = (c: rgbStripType["color"]): string => {
    return (
        "#" +
        ((1 << 24) + (c.red << 16) + (c.green << 8) + c.blue)
            .toString(16)
            .slice(1)
    );
};
