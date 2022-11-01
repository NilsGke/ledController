import { rgbStripType } from "../../../src/ledStrip/types";

const sendColorToServer = (
    ws: WebSocket,
    stripName: rgbStripType["name"],
    color: rgbStripType["color"]
): void => ws.send(JSON.stringify({ set: "color", stripName, color }));

export default sendColorToServer;
