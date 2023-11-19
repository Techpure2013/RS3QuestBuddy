import { Routes, Route, HashRouter, Navigate, Outlet } from "react-router-dom";
import QuestCarousel from "./QuestCarousel";
import QuestPage from "./pages/questpage";
function App() {
    return (
        <>
            <HashRouter>
                <Routes>
                    <Route path="/src/App.tsx">
                        {/* put url base here and nest children routes */}
                        <Route path="" element={<QuestCarousel />} />
                    </Route>
                    <Route path="/QuestPage" element={<QuestPage />} />
                    <Route path="/*" element={<Navigate to="/src/App.tsx" />} />
                    {/* navigate to default route if no url matched */}
                </Routes>
            </HashRouter>
            <Outlet />
        </>
    );
}

export default App;
