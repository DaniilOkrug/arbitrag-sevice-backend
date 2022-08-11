const Router = require("express").Router;
const axios = require("axios");

const userController = require("../controllers/user.controller");
const router = new Router();

router.get("/", async (req, res) => {
  const response = await axios.get("http://178.20.43.144:5000/");

  res.setHeader("Access-Control-Allow-Origin", process.env.ORIGIN);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);

  res.json(response.data);
});

module.exports = router;
