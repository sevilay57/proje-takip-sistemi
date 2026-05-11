const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({
      message: "Token yok, giriş gerekli",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, "gizliAnahtar");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      message: "Geçersiz token",
    });
  }
};

module.exports = authMiddleware;