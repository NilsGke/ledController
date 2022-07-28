import express from "express";
import { applyPreset, setup, strips } from "./controller";
import { effects } from "./effects";
import { ledValue, rgbStripType } from "./ledStrip/types";
import { presets } from "./presets";
import checkColor from "./util/checkColor";

const router = express.Router();

router.get("/ping", (req, res) => res.sendStatus(200));

router.get("/info", (req, res) =>
    res.send(JSON.stringify({ strips, presets, effects }))
);

router.get("/info/presets", (req, res) =>
    res.send(JSON.stringify({ presets }))
);

// set strips
router.get("/strips/:name/set/color/:r/:g/:b", (req, res) => {
    // get strip
    const strip = strips.find((strip) => strip.name === req.params.name);
    if (strip === undefined) return res.status(404).send("strip not found");

    const colorValues: rgbStripType["color"] = {
        red: parseInt(req.params.r) as ledValue,
        green: parseInt(req.params.g) as ledValue,
        blue: parseInt(req.params.b) as ledValue,
    };

    if (!checkColor(colorValues))
        res.sendStatus(400).send(
            "requested color values are invalid and do not match the required type (0-255)"
        );

    // set color
    strip.setColors(colorValues).then(() => res.sendStatus(200));
});


// preset
router.get("/presets/apply/:name", (req, res) => {
    const preset = presets.find((preset) => preset.name === req.params.name);
    if (preset === undefined) res.status(404).send("preset not found");

    applyPreset(undefined, req.params.name).then(() => res.sendStatus(200));
});

// TODO: all strips
router.get("/strips/all/set/color/:r/:g/:b", (req, res) => { });

export default router;
