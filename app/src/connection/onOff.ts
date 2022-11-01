export type onOff = "on" | "off";

const setOnOff = (ws: WebSocket, state: onOff) =>
    ws.send(JSON.stringify({ on: state }));

export default setOnOff;
