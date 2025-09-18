const express = require('express');
const router = express.Router();
const { aiChat } = require('../controllers/aiController');

// POST /api/ai/chat
router.post('/chat', aiChat);

module.exports = router;