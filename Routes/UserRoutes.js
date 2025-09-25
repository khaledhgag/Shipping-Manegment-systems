// تحديث UserRoutes.js
const express = require('express');
const { login, register, createUser, getUsers } = require('../services/UserService');
const { authMiddleware, requireRole } = require('../Midlleware/authMiddleware');

const router = express.Router();

router.post('/login', login);
router.post('/register', register); // إضافة مسار التسجيل
router.post('/', authMiddleware, requireRole(['admin']), createUser);
router.get('/', authMiddleware, requireRole(['admin']), getUsers);

module.exports = router;