import { Routes, Route, BrowserRouter, Navigate, Outlet } from "react-router-dom";
import QuestCarousel from "./../pages/Quest Picker/QuestCarousel";
import QuestPage from "./../pages/Quest Details/questpage";
import { SettingsProvider } from "./Entrance Components/SettingsContext";
import { usePlayerStoreInit } from "./../state/usePlayerSelector";
import { ToastProvider } from "./../Components/Toast/useToast";
import { AppWithVersionCheck } from "./Entrance Components/AppWithVersionCheck";

function App() {
	usePlayerStoreInit();
	return (
		<>
			<ToastProvider>
				<AppWithVersionCheck>
					<SettingsProvider>
						<BrowserRouter basename="/RS3QuestBuddy">
							<Routes>
								<Route path="/" element={<QuestCarousel />} />
								<Route path="/:questName" element={<QuestPage />} />
								<Route path="*" element={<Navigate to="/" />} />
							</Routes>
						</BrowserRouter>
					</SettingsProvider>
				</AppWithVersionCheck>
			</ToastProvider>
			<Outlet />
		</>
	);
}

export default App;
