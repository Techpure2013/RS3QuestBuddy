/**
 * A generic event emitter with type-safe event handling.
 *
 * @typeparam T - A type representing the events and their payload types.
 */
export class TypedEmitter<T extends Record<string, any>> {
	constructor() {
		this.on = this.on.bind(this);
		this.off = this.off.bind(this);
		this.emit = this.emit.bind(this);
		this.once = this.once.bind(this);
		this.listenersChanged = this.listenersChanged.bind(this);
	}
	/**
	 * Object to store event listeners.
	 * Each key represents an event, and the corresponding value is a Set of listeners for that event.
	 */
	private listeners: { [key in keyof T]?: Set<(v: T[key]) => void> } = {};
	/**
	 * Add a listener for a specific event.
	 *
	 * @param event - The event key.
	 * @param listener - The callback function to be invoked when the event is emitted.
	 */
	on<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners =
			this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.add(listener);
		this.listenersChanged(event, listeners);
	}
	/**
	 * Add a one-time listener for a specific event.
	 * The listener will be automatically removed after it's invoked once.
	 *
	 * @param event - The event key.
	 * @param listener - The callback function to be invoked once when the event is emitted.
	 */
	once<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners =
			this.listeners[event] ?? (this.listeners[event] = new Set());
		let oncer = (v: T[K]) => {
			listeners.delete(oncer);
			listener(v);
		};
		listeners.add(oncer);
		this.listenersChanged(event, listeners);
	}
	/**
	 * Remove a listener for a specific event.
	 *
	 * @param event - The event key.
	 * @param listener - The callback function to be removed.
	 */
	off<K extends keyof T>(event: K, listener: (v: T[K]) => void) {
		let listeners =
			this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.delete(listener);
		this.listenersChanged(event, listeners);
	}

	/**
	 * Emit an event with a payload.
	 *
	 * @param event - The event key.
	 * @param value - The payload value to be passed to the listeners.
	 */
	emit<K extends keyof T>(event: K, value: T[K]) {
		let listeners =
			this.listeners[event] ?? (this.listeners[event] = new Set());
		listeners.forEach((cb) => cb(value));
	}

	/**
	 * Handle changes in listeners for a specific event.
	 *
	 * @param event - The event key.
	 * @param listeners - The updated Set of listeners for the event.
	 */
	listenersChanged<K extends keyof T>(
		event: K,
		listeners: Set<(v: T[K]) => void>
	) {
		// Update the listeners for the specified event
		this.listeners[event] = listeners;

		// Log that listeners for the event have been updated
		console.log(`Listeners for event ${String(event)} have been updated.`);
	}
}
