import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./Dashboard";
import EditEffect from "./EditEffect";
import EffectsOverview from "./EffectsOverview";
import connection from "./connectionConfig.json";

import "./styles/index.sass";
import { receiveMessage } from "./connection/messageEvent";
import { getTimeDifference } from "./connection/timeDifference";

const Router = () => {
    var ws = useRef(
        new WebSocket(
            `ws://${connection.ip}:${connection.port}`,
            "echo-protocol"
        )
    ).current;

    const [connected, setConnected] = useState(false);

    useEffect(() => {
        ws.onopen = () => {
            setConnected(true);
            console.log("connected");
            getTimeDifference(ws);
        };

        ws.onclose = (e) => {
            setConnected(true);
            console.log("disconnected");
        };

        ws.onerror = (e) => {
            console.error(e);
        };

        ws.onmessage = (e) => {
            receiveMessage(e);
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!connected)
        return (
            <div className="dashboard loading">
                <CircularProgress /> connecting to WebSocket...
            </div>
        );

    return (
        <ThemeProvider
            theme={createTheme({
                palette: {
                    mode: "dark",
                },
            })}
        >
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard ws={ws} />} />
                    <Route
                        path="/effects"
                        element={<EffectsOverview ws={ws} />}
                    />
                    <Route
                        path="/effects/:effectName"
                        element={<EditEffect ws={ws} />}
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

const App: React.FC = () => <Router />;

export default App;
