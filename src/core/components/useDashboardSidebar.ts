"use client";

import { useCallback, useEffect, useState } from "react";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function useDashboardSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);

    const syncSidebarWithViewport = () => {
      setSidebarOpen(mediaQuery.matches);
    };

    syncSidebarWithViewport();
    mediaQuery.addEventListener("change", syncSidebarWithViewport);

    return () => {
      mediaQuery.removeEventListener("change", syncSidebarWithViewport);
    };
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((isOpen) => !isOpen);
  }, []);

  return {
    closeSidebar,
    setSidebarOpen,
    sidebarOpen,
    toggleSidebar,
  };
}
