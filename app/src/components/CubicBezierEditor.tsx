import { useCallback, useEffect, useRef, useState } from "react";
import { effect, point } from "../../../src/effects";
import getCubic from "../helpers/cubicBezier";
import "../styles/cubicBezierEditor.sass";

type timingFunction = effect["timingFunction"];

type props = {
    timingFunction: timingFunction;
    change: (points: effect["timingFunction"]) => void;
    from: effect["keyframes"][0]["color"];
    to: effect["keyframes"][0]["color"];
};

const size = 500;
const padding = 17;
const circleSize = 15;

const CubicBezierEditor: React.FC<props> = ({
    timingFunction,
    change,
    from,
    to,
}) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [movingP1, setMovingP1] = useState<boolean>(false);
    const [movingP2, setMovingP2] = useState<boolean>(false);

    // draw
    useEffect(() => {
        if (canvasRef.current === null || timingFunction === undefined) return;

        const ctx = canvasRef.current.getContext("2d");

        if (ctx === null) throw new Error("canvas context is null");

        const P1 = timingFunction?.P1;
        const P2 = timingFunction?.P2;
        const PStart: point = { x: 0, y: 0 };
        const PEnd: point = { x: 1, y: 1 };

        const C1 = from;
        const C2 = to;

        ctx.clearRect(0, 0, size + padding * 2, size + padding * 2);

        // draw lines
        ctx.strokeStyle = "#5f5f5f";
        ctx.beginPath();
        ctx.moveTo(size + padding, size + padding);
        ctx.lineTo(P1.x * size + padding, P1.y * size + padding);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0 + padding, 0 + padding);
        ctx.lineTo(P2.x * size + padding, P2.y * size + padding);
        ctx.stroke();

        // draw bezier
        // gradient
        var grad = ctx.createLinearGradient(
            (size + padding) / 2,
            padding,
            (size + padding) / 2,
            size + padding
        );
        grad.addColorStop(0, `rgb(${C1.red},${C1.green},${C1.blue})`);
        grad.addColorStop(1, `rgb(${C2.red},${C2.green},${C2.blue})`);
        ctx.strokeStyle = grad;

        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.moveTo(padding, padding);
        for (let i = 0; i <= size; i++) {
            const v = getCubic(P1, P2, i / size);
            ctx.lineTo(v.x * size + padding, v.y * size + padding);
        }
        ctx.stroke();

        // draw stationary points
        ctx.fillStyle = "#555555";
        ctx.beginPath();
        ctx.arc(
            PStart.x * size + padding,
            PStart.y * size + padding,
            circleSize / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = "#555555";
        ctx.beginPath();
        ctx.arc(
            PEnd.x * size + padding,
            PEnd.y * size + padding,
            circleSize / 4,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // draw movable points
        ctx.fillStyle = movingP1 ? "white" : "#cccccc";
        ctx.beginPath();
        ctx.arc(
            P1.x * size + padding,
            P1.y * size + padding,
            circleSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        ctx.fillStyle = movingP2 ? "white" : "#cccccc";
        ctx.beginPath();
        ctx.arc(
            P2.x * size + padding,
            P2.y * size + padding,
            circleSize,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // update result span
        // (document.getElementById("result") as HTMLSpanElement).innerText =
        //     "\n" + JSON.stringify({ PStart, PEnd, P1, P2 }, null, "    ");
    }, [canvasRef, from, movingP1, movingP2, timingFunction, to]);

    const start = useCallback(
        (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (canvas === null)
                throw new Error(
                    "cannot access canvas and cannot set event listeners"
                );

            if (timingFunction === undefined) return;

            const { x, y } = getMousePos(canvas, e);

            if (
                Math.pow(timingFunction.P1.x * size + padding - x, 2) +
                    Math.pow(timingFunction.P1.y * size + padding - y, 2) <
                Math.pow(circleSize, 2)
            ) {
                setMovingP1(true);
            } else if (
                Math.pow(timingFunction.P2.x * size + padding - x, 2) +
                    Math.pow(timingFunction.P2.y * size + padding - y, 2) <
                Math.pow(circleSize, 2)
            ) {
                setMovingP2(true);
            }
        },
        [timingFunction]
    );

    const move = useCallback(
        (e: MouseEvent) => {
            const canvas = canvasRef.current;
            if (canvas === null)
                throw new Error(
                    "cannot access canvas and cannot set event listeners"
                );

            if (timingFunction === undefined) return;

            let { x, y } = getMousePos(canvas, e);

            const P1 = timingFunction.P1;
            const P2 = timingFunction.P2;

            if (
                Math.pow(P1.x * size + padding - x, 2) +
                    Math.pow(P1.y * size + padding - y, 2) <
                    Math.pow(circleSize, 2) ||
                Math.pow(P2.x * size + padding - x, 2) +
                    Math.pow(P2.y * size + padding - y, 2) <
                    Math.pow(circleSize, 2)
            ) {
                canvas.classList.add("hoveringCircle");
            } else {
                canvas.classList.remove("hoveringCircle");
            }

            // getting the actual values
            // dirtiest hack i have ever done but i have no idea how else i would do this
            let [moveP1, moveP2] = [false, false];
            setMovingP1((prev) => {
                moveP1 = prev;
                return prev;
            });
            setMovingP2((prev) => {
                moveP2 = prev;
                return prev;
            });

            // prevent going out right or bottom
            x = x > canvas.width - padding ? canvas.width - padding : x;
            y = y > canvas.height - padding ? canvas.height - padding : y;

            // prevent going out left or top
            x = x < padding ? padding : x;
            y = y < padding ? padding : y;

            if (moveP1 || moveP2)
                change({
                    P1: moveP1
                        ? {
                              x: (x - padding) / size,
                              y: (y - padding) / size,
                          }
                        : timingFunction.P1,
                    P2: moveP2
                        ? {
                              x: (x - padding) / size,
                              y: (y - padding) / size,
                          }
                        : timingFunction.P2,
                });
        },
        [change, timingFunction]
    );

    const clear = () => {
        setMovingP1(false);
        setMovingP2(false);
    };

    // event handlers
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas === null)
            throw new Error(
                "cannot access canvas and cannot set event listeners"
            );

        canvas.addEventListener("mousedown", start);
        document.addEventListener("mousemove", move);
        document.addEventListener("mouseup", clear);

        return () => {
            canvas.removeEventListener("mousedown", start);
            document.removeEventListener("mousemove", move);
            document.removeEventListener("mouseup", clear);
        };
    }, [move]);

    return (
        <div id="cubicBezierEditor">
            <h2>Cubic-bezier:</h2>
            <canvas
                ref={canvasRef}
                height="534"
                width="534"
                id="canvas"
            ></canvas>
            <div className="inputs">
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            <td>X</td>
                            <td>Y</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {/* this is switched somewhere but its more convenient for the user if its like this*/}
                            <td>P1</td>
                            <td>
                                <input
                                    type="number"
                                    name="p2x"
                                    id="p2x"
                                    max={100}
                                    step={1}
                                    value={Math.round(
                                        (timingFunction?.P2.x || 0) * 100
                                    )}
                                    onChange={(e) =>
                                        timingFunction &&
                                        change({
                                            ...timingFunction,
                                            P2: {
                                                ...timingFunction.P2,
                                                x:
                                                    validateInputNumber(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    ) / 100,
                                            },
                                        })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    name="p2y"
                                    id="p2y"
                                    max={100}
                                    step={1}
                                    value={Math.round(
                                        (timingFunction?.P2.y || 0) * 100
                                    )}
                                    onChange={(e) =>
                                        timingFunction &&
                                        change({
                                            ...timingFunction,
                                            P2: {
                                                ...timingFunction.P2,
                                                y:
                                                    validateInputNumber(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    ) / 100,
                                            },
                                        })
                                    }
                                />
                            </td>
                        </tr>
                        <tr>
                            <td>P2</td>
                            <td>
                                <input
                                    type="number"
                                    name="p1x"
                                    id="p1x"
                                    max={100}
                                    step={1}
                                    value={Math.round(
                                        (timingFunction?.P1.x || 0) * 100
                                    )}
                                    onChange={(e) =>
                                        timingFunction &&
                                        change({
                                            ...timingFunction,
                                            P1: {
                                                ...timingFunction.P1,
                                                x:
                                                    validateInputNumber(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    ) / 100,
                                            },
                                        })
                                    }
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    name="p1y"
                                    id="p1y"
                                    max={100}
                                    step={1}
                                    value={Math.round(
                                        (timingFunction?.P1.y || 0) * 100
                                    )}
                                    onChange={(e) =>
                                        timingFunction &&
                                        change({
                                            ...timingFunction,
                                            P1: {
                                                ...timingFunction.P1,
                                                y:
                                                    validateInputNumber(
                                                        parseInt(
                                                            e.target.value
                                                        ) || 0
                                                    ) / 100,
                                            },
                                        })
                                    }
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CubicBezierEditor;

/**
 * function from https://stackoverflow.com/questions/17130395/real-mouse-position-in-canvas#:~:text=When%20Element%20and%20Bitmap%20are%20of%20different%20sizes
 */
function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
    var rect = canvas.getBoundingClientRect(), // abs. sntize of element
        scaleX = canvas.width / rect.width, // relationship bitmap vs. element for x
        scaleY = canvas.height / rect.height; // relationship bitmap vs. element for y

    return {
        x: Math.floor((evt.clientX - rect.left) * scaleX), // scale mouse coordinates after they have
        y: Math.floor((evt.clientY - rect.top) * scaleY), // been adjusted to be relative to element
    };
}

const validateInputNumber = (num: number): number =>
    num < 0 ? 0 : num > 100 ? 100 : num;
