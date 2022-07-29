import ws from "./connection";

const moveEffect = (id: number, direction: -1 | 1) => {
    ws.send(JSON.stringify({ moveEffect: id, direction }));
};

export default moveEffect;
