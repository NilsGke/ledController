import express from "express";
import api from "./src/api";
import { setup } from "./src/controller";

const app = express();
const port = process.env.PORT || 3030;

export const CONFIG = {
    ledRefreshRate: 200,
};

// api route
app.use("/api", api);

// static directory to server react app
app.use(express.static("app/build"));
// server react app
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/app/build/index.html");
});

app.listen(port, () => {
    console.log(`\x1b[42mServer is running on port: ${port}\x1b[0m`);
});

setup();
