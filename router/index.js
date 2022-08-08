const Router = require("express").Router;
const axios = require("axios");

const userController = require("../controllers/user.controller");
const router = new Router();

router.get("/", async (req, res) => {
  const response = await axios.get("http://178.20.43.144:5000/");

  console.log(response.data);

  res.json(response.data);
});

module.exports = router;
