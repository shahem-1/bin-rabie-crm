// Explanation file for the user, showing the steps to restart the server.
// This may be copied into documentation or shown in the UI.

# Restarting the development server

1. Open a terminal/command prompt.
2. Kill the prior Next.js instance:
   ```bash
   taskkill /PID 28336 /F
   ```
3. Start a fresh dev server:
   ```bash
   npm run dev
   ```

After the server is up you can reload the app at http://localhost:3001 and test the chat.
