"use client";

export function openPendingReferenceWindow() {
  const pendingWindow = window.open("about:blank", "_blank");

  if (pendingWindow) {
    pendingWindow.opener = null;
    pendingWindow.document.title = "Membuka referensi...";
  }

  return pendingWindow;
}

export function navigateReferenceWindow(
  pendingWindow: Window | null,
  url: string,
) {
  if (pendingWindow && !pendingWindow.closed) {
    pendingWindow.location.replace(url);
    return true;
  }

  return Boolean(window.open(url, "_blank", "noopener,noreferrer"));
}

export function closeReferenceWindow(pendingWindow: Window | null) {
  if (!pendingWindow || pendingWindow.closed) {
    return;
  }

  pendingWindow.close();
}
