import {
    Routes,
    Route,
    Navigate,
    Outlet,
    BrowserRouter,
} from "react-router-dom";
import QuestCarousel from "./QuestCarousel";
import QuestPage from "./pages/questpage";
import QuestImages from "./pages/QuestImages";

function App() {
    return (
        <>
            <BrowserRouter basename="/">
                <Routes>
                    <Route path="/">
                        {/* Your default route */}
                        <Route index element={<QuestCarousel />} />
                    </Route>
                    <Route path="/QuestImages" element={<QuestImages />} />
                    <Route path="/QuestPage" element={<QuestPage />} />
                    <Route path="/*" element={<Navigate to="/" />} />
                    {/* Navigate to the default route if no URL matched */}
                </Routes>
            </BrowserRouter>
            <Outlet />
        </>
    );
}

export default App;
