const Router = require('express').Router;
const userController = require('../controllers/user.controller');
const router = new Router();

router.get('/', (req, res) => {res.json('OK')});

module.exports = router;