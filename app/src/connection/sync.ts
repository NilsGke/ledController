import ws from "./connection";


const setStripSync = (value: boolean): void =>
    ws.send(JSON.stringify({ sync: value }))

export default setStripSync;
