const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Bu alana sadece admin erişebilir",
    });
  }

  next();
};

module.exports = adminMiddleware;