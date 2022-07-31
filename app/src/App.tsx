import CircularProgress from "@mui/material/CircularProgress/CircularProgress";
import createTheme from "@mui/material/styles/createTheme";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ws from "./connection/connection";
import Dashboard from "./Dashboard";
import EditEffect from "./EditEffect";
import EffectsOverview from "./EffectsOverview";

import "./styles/index.sass";

const Router = () => {
    if (ws.CONNECTING)
        return (
            <div className="dashboard loading">
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
