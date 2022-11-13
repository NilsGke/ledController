type point = { x: number; y: number };

const PStart: point = { x: 0, y: 0 };
const PEnd: point = { x: 1, y: 1 };

const getCubic = (P1: point, P2: point, t: number) => {
    const x0 = PStart.x;
    const y0 = PStart.y;

    const x3 = PEnd.x;
    const y3 = PEnd.y;

    const x2 = P1.x;
    const y2 = P1.y;

    const x1 = P2.x;
    const y1 = P2.y;

    const y = (t: number) =>
        Math.pow(1 - t, 3) * y0 +
        3 * Math.pow(1 - t, 2) * t * y1 +
        3 * (1 - t) * Math.pow(t, 2) * y2 +
        Math.pow(t, 3) * y3;

    const x = (t: number) =>
        Math.pow(1 - t, 3) * x0 +
        3 * Math.pow(1 - t, 2) * t * x1 +
        3 * (1 - t) * Math.pow(t, 2) * x2 +
        Math.pow(t, 3) * x3;

    return { x: x(t), y: y(t) };
};

export const getPointsOnCurve = (P1: point, P2: point): point[] => {
    const precision = 1000;

    return Array.from({ length: precision }).map((s, i) =>
        getCubic(P1, P2, (1 / precision) * i)
    );
};

export const getClosestPointX = (points: point[], x: number): point["y"] => {
    // from stackoverflow: returns closest value
    return points.sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0].y;
};

export default getCubic;
