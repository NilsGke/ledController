import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import { green } from "@mui/material/colors";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import ws from "./connection/connection";
import Dashboard from "./Dashboard";

import "./styles/index.sass";

const Router = () => {
    const appRef = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        if (appRef.current !== null)
            appRef.current.classList.add(
                window.location.pathname.split("/")[1] || "dashboard"
            );
    }, []);


    if (ws.CONNECTING)
        return <div className="dashboard loading"><CircularProgress /></div>;

    return (
        <div id="app" ref={appRef}>
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
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </div>
    );
};

const App: React.FC = () => <Router />;

export default App;
