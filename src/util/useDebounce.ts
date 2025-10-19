import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: 150) {
	const [debounced, setDebounce] = useState<T>(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounce(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);

	return debounced;
}
