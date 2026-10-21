// Verify that the API now uses the chat endpoint:
// In your fetch call replace the URL with "/api/analysis/chat" and ensure a
// sessionId is sent.
// Example:  const res = await fetch("/api/analysis/chat", { … });

// Keep the old /api/analysis route only for legacy calls;
// the project should route all new chats through the chat endpoint.
