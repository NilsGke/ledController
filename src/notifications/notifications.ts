import { Response } from "express";
import { strips } from "../controller";
import { rgbStripType } from "../ledStrip/types";
import * as config from "./config.json";

export type notification = {
    color: rgbStripType["color"];
    timeStamp: number;
    duration: number;
};

const sendNotification = (
    notificationName: string,
    response: Response<any, Record<string, any>>
) => {
    const notification = config.notifications.find(
        (n) => n.name === notificationName
    );

    const timeStamp = Date.now();

    if (notification === undefined)
        return response
            .status(404)
            .send(`no notification found with the name: "${notificationName}"`);

    strips.forEach((strip) =>
        strip.setNotification({ ...notification, timeStamp } as notification)
    );
    response.sendStatus(200);
};

export default sendNotification;
