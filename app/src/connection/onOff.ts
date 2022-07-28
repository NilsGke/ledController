import ws from "./connection"

export type onOff = "on" | "off";

const setOnOff = (state: onOff) => ws.send(JSON.stringify({ on: state }))


export default setOnOff;