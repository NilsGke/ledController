import { useEffect, useRef, useState } from "react";
import { keyframe } from "../../../src/effects";
import Slider, { SliderThumb } from "@mui/material/Slider/Slider";
import { indexedKeyframe } from "../EditEffect";
import "../styles/slider.sass";

type props = {
    keyframes: indexedKeyframe[];
    activeKeyframeId: indexedKeyframe["id"];
    changeActiveKeyframe: (id: indexedKeyframe["id"]) => void;
    onChange: (keyframes: indexedKeyframe[]) => void;
    onChangeCommit: (keyframes: indexedKeyframe[]) => void;
};

/**
 * this is my own slider component because the MUI one worked but i could not switch the keyframes (slider thumbs) and it was overall somewhat limited, so i made my own :)
 * its basically a stack of the mui sliders with the thumbs positioned to be at the top. This way i dont have to make my own draggable element.
 */
const CustomSlider: React.FC<props> = ({
    keyframes,
    activeKeyframeId,
    changeActiveKeyframe,
    onChange,
    onChangeCommit,
}) => {
    // add color to keyframes
    const trackRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        (
            Array.from(
                trackRef.current?.getElementsByClassName("MuiSlider-thumb") ||
                    []
            ) as HTMLElement[]
        ).forEach((thumb) => {
            const id = parseInt(
                (thumb.children[0].getAttribute("aria-label") || "-1").replace(
                    "slider",
                    ""
                )
            );

            const keyframe = keyframes.find((frame) => id === frame.id);

            if (keyframe === undefined)
                return console.warn(
                    "could not find keyframe with id: " +
                        thumb.getAttribute("data-id")
                );

            thumb.style.outlineColor = `rgb(${keyframe.color.red}, ${keyframe.color.green}, ${keyframe.color.blue})`;
            if (id === activeKeyframeId)
                thumb.style.backgroundColor = `rgb(${keyframe?.color.red}, ${keyframe?.color.green}, ${keyframe?.color.blue})`;
        });
    });

    // apply gradient
    useEffect(() => {
        if (!trackRef.current) return;
        const elements = Array.from(
            trackRef.current.getElementsByClassName("MuiSlider-rail")
        ) as HTMLElement[];
        elements[
            elements.length - 1
        ].style.background = `linear-gradient(to right, ${keyframes
            .map(
                (frame) =>
                    `rgb(${frame.color.red}, ${frame.color.green}, ${frame.color.blue}) ${frame.step}%`
            )
            .join(", ")})`;
    });

    const sliderChange = (frameId: indexedKeyframe["id"], value: number) => {
        changeActiveKeyframe(frameId);
        const index = keyframes.findIndex((frame) => frame.id === frameId);
        const newKeyframes = keyframes.slice();
        newKeyframes[index].step = value;
        onChange(newKeyframes);
    };

    // couldnt solve props with types as it was very complicated and i am not that deep into typescript to figure this out
    const KeyFrameThumb = (props: any) => {
        const { children, ...other } = props;
        const id =
            parseInt(
                props.children.props["aria-label"].replace("slider", "")
            ) || -1;
        const frame = keyframes.find((frame) => frame.id === id);
        console.log(frame);
        return (
            <SliderThumb
                {...other}
                className={
                    "MuiSlider-thumb" +
                    (frame?.id === activeKeyframeId ? " active" : "")
                }
            >
                {children}
            </SliderThumb>
        );
    };

    return (
        <div className="sliderContainer">
            <div className="track" ref={trackRef}>
                {keyframes.map((frame) => (
                    <Slider
                        className={
                            "muiSlider" +
                            (activeKeyframeId === frame.id ? " active" : "")
                        }
                        aria-label={"slider" + frame.id}
                        value={frame.step}
                        track={false}
                        components={{
                            Thumb: KeyFrameThumb,
                        }}
                        marks={[...new Array(11)].map((d, i) => ({
                            value: i * 10,
                        }))}
                        onChange={(ev: Event, val: number | number[]) => {
                            sliderChange(
                                frame.id,
                                Array.isArray(val) ? val[0] : val
                            );
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default CustomSlider;