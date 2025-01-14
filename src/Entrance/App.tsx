import { Routes, Route, HashRouter, Navigate, Outlet } from "react-router-dom";
import QuestCarousel from "./../pages/Quest Picker/QuestCarousel";
import QuestPage from "./../pages/Quest Details/questpage";

function App() {
  return (
    <>
      <HashRouter basename="/">
        <Routes>
          <Route path="/">
            {/* Your default route */}
            <Route index element={<QuestCarousel />} />
          </Route>

          <Route path="/QuestPage" element={<QuestPage />} />
          <Route path="/*" element={<Navigate to="/" />} />
          {/* Navigate to the default route if no URL matched */}
        </Routes>
      </HashRouter>
      <Outlet />
    </>
  );
}

export default App;
