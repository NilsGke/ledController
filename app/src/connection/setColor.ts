import { rgbStripType } from "../../../src/ledStrip/types";
import ws from "./connection";


const sendColorToServer = (stripName: rgbStripType["name"], color: rgbStripType["color"]): void =>
    ws.send(JSON.stringify({ set: "color", stripName, color }))

export default sendColorToServer;
