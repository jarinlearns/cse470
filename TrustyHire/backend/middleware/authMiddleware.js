const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This validates the token automatically using your Secret Key
const protect = ClerkExpressRequireAuth();

module.exports = { protect };