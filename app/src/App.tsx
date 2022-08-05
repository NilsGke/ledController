import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ws, { wsConnected, wsEvents } from "./connection/connection";
import Dashboard from "./Dashboard";
import EditEffect from "./EditEffect";
import EffectsOverview from "./EffectsOverview";

import "./styles/index.sass";

const Router = () => {
    const [connected, setConnected] = useState(wsConnected);

    // handle connection
    useEffect(() => {
        const handleConnection = () => setConnected(true);
        wsEvents.addEventListener("connectionOpened", handleConnection);
        return () =>
            wsEvents.removeEventListener("connectionOpened", handleConnection);
    }, []);

    // handle disconnect
    useEffect(() => {
        const handleDisconnect = () => setConnected(false);
        wsEvents.addEventListener("connectionClosed", handleDisconnect);
        return () =>
            wsEvents.removeEventListener("connectionClosed", handleDisconnect);
    }, []);

    if (!connected)
        return (
            <div className="dashboard loading">
                connecting...
                <CircularProgress />
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
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/effects" element={<EffectsOverview />} />
                    <Route
                        path="/effects/:effectName"
                        element={<EditEffect />}
                    />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
};

const App: React.FC = () => <Router />;

export default App;
