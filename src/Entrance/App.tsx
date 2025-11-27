import { Routes, Route, HashRouter, Navigate, Outlet } from "react-router-dom";
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
					</SettingsProvider>
				</AppWithVersionCheck>
			</ToastProvider>
			<Outlet />
		</>
	);
}

export default App;
