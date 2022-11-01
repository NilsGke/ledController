const moveEffect = (ws: WebSocket, id: number, direction: -1 | 1) => {
    ws.send(JSON.stringify({ moveEffect: id, direction }));
};

export default moveEffect;
