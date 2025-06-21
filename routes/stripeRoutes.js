const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { createCheckoutSession } = require('../controllers/stripe');

router.post('/create-checkout-session', verifyToken, createCheckoutSession);

module.exports = router;
