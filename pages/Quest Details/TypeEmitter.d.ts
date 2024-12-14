/**
 * A generic event emitter with type-safe event handling.
 *
 * @typeparam T - A type representing the events and their payload types.
 */
export declare class TypedEmitter<T extends Record<string, any>> {
    constructor();
    /**
     * Object to store event listeners.
     * Each key represents an event, and the corresponding value is a Set of listeners for that event.
     */
    private listeners;
    /**
     * Add a listener for a specific event.
     *
     * @param event - The event key.
     * @param listener - The callback function to be invoked when the event is emitted.
     */
    on<K extends keyof T>(event: K, listener: (v: T[K]) => void): void;
    /**
     * Add a one-time listener for a specific event.
     * The listener will be automatically removed after it's invoked once.
     *
     * @param event - The event key.
     * @param listener - The callback function to be invoked once when the event is emitted.
     */
    once<K extends keyof T>(event: K, listener: (v: T[K]) => void): void;
    /**
     * Remove a listener for a specific event.
     *
     * @param event - The event key.
     * @param listener - The callback function to be removed.
     */
    off<K extends keyof T>(event: K, listener: (v: T[K]) => void): void;
    /**
     * Emit an event with a payload.
     *
     * @param event - The event key.
     * @param value - The payload value to be passed to the listeners.
     */
    emit<K extends keyof T>(event: K, value: T[K]): void;
    /**
     * Handle changes in listeners for a specific event.
     *
     * @param event - The event key.
     * @param listeners - The updated Set of listeners for the event.
     */
    listenersChanged<K extends keyof T>(event: K, listeners: Set<(v: T[K]) => void>): void;
}
