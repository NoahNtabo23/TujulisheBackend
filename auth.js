function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).send("Missing Authorization header");
  }

  const token = header.replace("Bearer ", "");

  // Token must match our fake pattern
  if (!token.startsWith("partner-token-")) {
    return res.status(401).send("Invalid token");
  }

  const partnerId = token.replace("partner-token-", "");

  // Attach the partner to the request
  req.partner = { id: partnerId };

  next();
}

module.exports = { requireAuth };
