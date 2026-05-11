const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");

const sequelize = require("./config/database");

const User = require("./models/User");

require("./models/Project");
require("./models/Personnel");
require("./models/ProjectPersonnel");
require("./models/Material");
require("./models/Company");
require("./models/Offer");
require("./models/Supplier");
require("./models/ProjectMaterial");
require("./models/OfferItem");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const personnelRoutes = require("./routes/personnelRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const materialRoutes = require("./routes/materialRoutes");
const companyRoutes = require("./routes/companyRoutes");
const offerRoutes = require("./routes/offerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const projectMaterialRoutes = require("./routes/projectMaterialRoutes");
const offerItemRoutes = require("./routes/offerItemRoutes");
const userRoutes = require("./routes/userRoutes");

const authMiddleware = require("./middlewares/authMiddleware");
const adminMiddleware = require("./middlewares/adminMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/personnel", personnelRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/project-materials", projectMaterialRoutes);
app.use("/api/offer-items", offerItemRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Proje Takip Sistemi Çalışıyor");
});

app.get("/api/protected", authMiddleware, (req, res) => {

  res.json({
    message: "Korumalı alana giriş başarılı",
    user: req.user,
  });

});

app.get(
  "/api/admin",
  authMiddleware,
  adminMiddleware,
  (req, res) => {

    res.json({
      message: "Admin paneline hoş geldin",
    });

  }
);

sequelize.sync().then(async () => {

  const hashedPassword = await bcrypt.hash("123456", 10);

  await User.findOrCreate({
    where: {
      email: "emreturansah@gmail.com",
    },

    defaults: {
      name: "Emre Turanşah",
      password: hashedPassword,
      role: "admin",
    },
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server çalışıyor ${PORT}`);
  console.log("Database bağlandı");
});
}); 