import { useEffect, useRef } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
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

    return (
        <div id="app" ref={appRef}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

const App: React.FC = () => <Router />;

export default App;
