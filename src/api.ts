import express from "express";
import { applyPreset, setup, strips } from "./controller";
import { effects } from "./effects/effect";
import { ledColorValue, rgbStripType } from "./ledStrip/types";
import { presets } from "./presets";

const router = express.Router();

router.get("/ping", (req, res) => res.sendStatus(200));

router.get("/info", (req, res) =>
    res.send(JSON.stringify({ strips, presets, effects }))
);

router.get("/info/presets", (req, res) =>
    res.send(JSON.stringify({ presets }))
);

router.get("/strips/:name/set/:r/:g/:b", (req, res) => {
    // get strip
    const strip = strips.find((strip) => strip.name === req.params.name);
    if (strip === undefined) res.status(404).send("strip not found");

    const colorValues = {
        red: parseInt(req.params.r),
        green: parseInt(req.params.g),
        blue: parseInt(req.params.b),
    };

    const colorArray = [colorValues.red, colorValues.green, colorValues.blue];

    // check that color is between 0 and 255
    colorArray.forEach((c, i) => {
        if (c > 255 || c < 0)
            return res
                .status(400)
                .send(
                    `color: ${["red", "green", "blue"].at(
                        i
                    )}: ${c} is an invalid color`
                );
    });

    // set color
    strip
        ?.setColors(colorValues as rgbStripType["color"])
        .then(() => res.sendStatus(200));
});

router.get("/presets/apply/:name", (req, res) => {
    const preset = presets.find((preset) => preset.name === req.params.name);
    if (preset === undefined) res.status(404).send("preset not found");

    applyPreset(undefined, req.params.name).then(() => res.sendStatus(200));
});

export default router;
