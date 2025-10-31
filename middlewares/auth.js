const ADMIN_IDS = (process.env.ADMIN_IDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

function requireAuth(req, res, next) {
  const apiKey = req.header("x-api-key");
  const userId = req.header("x-user-id");
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res
      .status(401)
      .json({ error: "Unauthorized: invalid or missing API key" });
  }
  if (!userId) {
    return res
      .status(400)
      .json({ error: "Missing required header: x-user-id" });
  }
  req.user = { id: userId, isAdmin: ADMIN_IDS.includes(userId) };
  next();
}

module.exports = { requireAuth };
