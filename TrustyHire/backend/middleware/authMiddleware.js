const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This function acts as the "protect" middleware
// It checks if the request has a valid Clerk token
const protect = ClerkExpressRequireAuth({
  // Optional: Add configuration here if needed
});

module.exports = { protect };