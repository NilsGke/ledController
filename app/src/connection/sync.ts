const setStripSync = (ws: WebSocket, value: boolean): void =>
    ws.send(JSON.stringify({ sync: value }));

export default setStripSync;
