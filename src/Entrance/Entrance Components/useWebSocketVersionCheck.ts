// src/hooks/useWebSocketVersionCheck.ts
import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { getApiBase } from "../../api/base";

/**
 * WebSocket-based version checking with:
 * - Real-time update notifications from server
 * - Automatic reconnection
 * - Fallback to polling if WebSocket fails
 * - Toast integration support
 */

const FALLBACK_POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes fallback

interface VersionUpdateData {
  version: string;
  timestamp: string;
}

interface ToastBroadcastData {
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
  timestamp: string;
}

export const useWebSocketVersionCheck = (
  onUpdateAvailable?: (newVersion: string) => void,
  onToastBroadcast?: (message: string, type: "success" | "error" | "info" | "warning", duration?: number) => void
) => {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newVersion, setNewVersion] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const clientVersionRef = useRef<string | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const onUpdateAvailableRef = useRef(onUpdateAvailable);
  const onToastBroadcastRef = useRef(onToastBroadcast);

  const checkVersionViaHttp = useCallback(async () => {
    if (!clientVersionRef.current) return;

    try {
      // In dev, API is proxied to 127.0.0.1:42069
      // In prod, API is same origin
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isDev ? 'http://127.0.0.1:42069/api' : getApiBase();
      const response = await fetch(`${apiUrl}/version`, { cache: "no-cache" });
      if (!response.ok) return;

      const data = await response.json();
      setLastChecked(new Date());

      if (data.version && clientVersionRef.current === data.version) {
        // Versions match - clear any previous notification flag
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion) {
          console.log(`[HTTP] Versions now match (${data.version}), clearing notification flag`);
          localStorage.removeItem("notified_version");
        }
        return;
      }

      if (data.version && clientVersionRef.current !== data.version) {
        // Check if user has already been notified about this version
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion === data.version) {
          console.log(`[HTTP] Already notified about version ${data.version}, skipping notification`);
          return;
        }

        console.log(
          `New version available! Client: ${clientVersionRef.current}, Server: ${data.version}`
        );

        // Store that we've notified about this version
        localStorage.setItem("notified_version", data.version);

        setNewVersion(data.version);
        setIsUpdateAvailable(true);
        onUpdateAvailable?.(data.version);
      }
    } catch (error) {
      console.error("HTTP version check failed:", error);
    }
  }, [onUpdateAvailable]);

  const scheduleFallbackPoll = useCallback(() => {
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }

    fallbackTimerRef.current = setTimeout(() => {
      if (!isConnected && !isUpdateAvailable) {
        console.log("WebSocket disconnected, using HTTP fallback");
        checkVersionViaHttp();
        scheduleFallbackPoll();
      }
    }, FALLBACK_POLL_INTERVAL);
  }, [isConnected, isUpdateAvailable, checkVersionViaHttp]);

  // Keep callback refs updated
  useEffect(() => {
    onUpdateAvailableRef.current = onUpdateAvailable;
  }, [onUpdateAvailable]);

  useEffect(() => {
    onToastBroadcastRef.current = onToastBroadcast;
  }, [onToastBroadcast]);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (socketRef.current) {
      return;
    }

    isMountedRef.current = true;

    try {
      // Get client version from meta tag
      const meta = document.querySelector('meta[name="app-version"]');
      clientVersionRef.current = meta?.getAttribute("content") || null;

      if (!clientVersionRef.current) {
        console.warn("App version meta tag not found.");
        return;
      }

      const api = getApiBase();
      if (!api) {
        console.warn("API base URL not available");
        return;
      }

      // Determine WebSocket server URL
      // In dev: backend runs on different port (42069)
      // In prod: same origin as frontend
      const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const wsOrigin = isDev
        ? `http://127.0.0.1:42069`  // Backend server in dev
        : window.location.origin;   // Same origin in production

      console.log(`Connecting to WebSocket at: ${wsOrigin}`);

      // Initialize Socket.IO connection
      const socket = io(wsOrigin, {
      path: "/socket.io/",
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    // Store socket in ref to prevent recreation
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      if (!isMountedRef.current) return;

      console.log("WebSocket connected to update service");
      setIsConnected(true);

      // Request current version on connect
      socket.emit("version:request");

      // Clear fallback polling
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    });

    socket.on("disconnect", () => {
      if (!isMountedRef.current) return;

      console.log("WebSocket disconnected from update service");
      setIsConnected(false);

      // Start fallback polling
      scheduleFallbackPoll();
    });

    // Version events
    socket.on("version:current", (data: VersionUpdateData) => {
      if (!isMountedRef.current) return;

      setLastChecked(new Date());

      if (data.version && clientVersionRef.current === data.version) {
        // Versions match - clear any previous notification flag
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion) {
          console.log(`Versions now match (${data.version}), clearing notification flag`);
          localStorage.removeItem("notified_version");
        }
        return;
      }

      if (data.version && clientVersionRef.current !== data.version) {
        // Check if user has already been notified about this version
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion === data.version) {
          console.log(`Already notified about version ${data.version}, skipping notification`);
          return;
        }

        console.log(
          `Version mismatch detected! Client: ${clientVersionRef.current}, Server: ${data.version}`
        );
        console.log("Setting isUpdateAvailable to true");
        console.log("Calling onUpdateAvailable callback:", onUpdateAvailableRef.current ? "exists" : "missing");

        // Store that we've notified about this version
        localStorage.setItem("notified_version", data.version);

        setNewVersion(data.version);
        setIsUpdateAvailable(true);
        onUpdateAvailableRef.current?.(data.version);
        console.log("Update notification should now appear");
      }
    });

    socket.on("version:update", (data: VersionUpdateData) => {
      if (!isMountedRef.current) return;

      console.log("Received version update broadcast:", data);
      setLastChecked(new Date());

      if (data.version && clientVersionRef.current === data.version) {
        // Versions match - clear any previous notification flag
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion) {
          console.log(`[version:update] Versions now match (${data.version}), clearing notification flag`);
          localStorage.removeItem("notified_version");
        }
        return;
      }

      if (data.version && clientVersionRef.current !== data.version) {
        // Check if user has already been notified about this version
        const notifiedVersion = localStorage.getItem("notified_version");
        if (notifiedVersion === data.version) {
          console.log(`[version:update] Already notified about version ${data.version}, skipping notification`);
          return;
        }

        console.log(
          `New version available! Client: ${clientVersionRef.current}, Server: ${data.version}`
        );
        console.log("[version:update] Setting isUpdateAvailable to true");
        console.log("[version:update] Calling onUpdateAvailable callback:", onUpdateAvailableRef.current ? "exists" : "missing");

        // Store that we've notified about this version
        localStorage.setItem("notified_version", data.version);

        setNewVersion(data.version);
        setIsUpdateAvailable(true);
        onUpdateAvailableRef.current?.(data.version);
        console.log("[version:update] Update notification should now appear");
      }
    });

    // Toast broadcast events
    socket.on("toast:broadcast", (data: ToastBroadcastData) => {
      if (!isMountedRef.current) return;

      console.log("[WebSocket] Received toast broadcast:", data);
      onToastBroadcastRef.current?.(data.message, data.type, data.duration);
    });

    socket.on("connect_error", (error) => {
      console.warn("WebSocket connection error:", error.message);
      // Fallback will be triggered by disconnect event
    });

      // Cleanup
      return () => {
        isMountedRef.current = false;
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
        if (socket) {
          socket.removeAllListeners();
          socket.disconnect();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.error("WebSocket version check initialization failed:", error);
      // Fallback to HTTP polling on error
      scheduleFallbackPoll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once

  return {
    isUpdateAvailable,
    lastChecked,
    isConnected,
    newVersion,
  };
};
