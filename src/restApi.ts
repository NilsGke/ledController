import { Router, json } from "express";
import { strips } from "./controller";
import checkColor from "./util/checkColor";
const restApi = Router();
restApi.use(json());

restApi.get("strips/:stripId", (req, res) => console.log(req, res));

// set color
restApi.post("/setColor", (req, res) => {
    const { stripId, color } = req.body;
    const strip = strips.find((s) => s.id === stripId);

    // check if strip exists
    if (strip === undefined) return res.status(400).send("strip not found");

    // check if color is valid
    if (!checkColor(color)) return res.status(400).send("color invalid");

    try {
        strip.setColors(color);
    } catch (error) {
        return res.status(500).send(error);
    }

    res.sendStatus(200);
});

export default restApi;
