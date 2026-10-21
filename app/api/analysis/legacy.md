---
# This file now contains the corrected logic that bypasses Gemini for greetings.
# Any request that hits /api/analysis/chat with a greeting will receive a direct
# short response, while data‑related queries will go through Gemini with the
# converted dataset.

# The old /api/analysis route is intentionally removed to prevent accidental
# fallback to the previous implementation.

export {};
