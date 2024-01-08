import React, { createContext, useContext, useState, ReactNode } from "react";

type TimerContextType = {
	intervalId: NodeJS.Timeout | null;
	startTimer: (callback: () => void) => void;
	stopTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimerContext = (): TimerContextType => {
	const context = useContext(TimerContext);
	if (!context) {
		throw new Error("useTimerContext must be used within a TimerProvider");
	}
	return context;
};

type TimerProviderProps = {
	children: ReactNode;
};

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
	const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
	const idArray: NodeJS.Timeout[] = [];
	const startTimer = (callback: () => void) => {
		if (!intervalId) {
			const id = setInterval(() => {
				callback();
				idArray.push(id);
				console.log(idArray);
				console.log("Interval triggered", id);
			}, 1000);
			return setIntervalId(id);
		}
	};

	const stopTimer = () => {
		if (intervalId) {
			clearInterval(intervalId);
			setIntervalId(null);
		}
	};

	return (
		<TimerContext.Provider value={{ intervalId, startTimer, stopTimer }}>
			{children}
		</TimerContext.Provider>
	);
};
