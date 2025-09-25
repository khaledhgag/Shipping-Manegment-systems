const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ✅ تسجيل دخول
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    res.json({ message: 'Login successful', token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ إنشاء يوزر جديد (Admin بس)
exports.createUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admin can create users' });
    }

    const { name, email, password, role } = req.body;
    const user = new User({ name, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User created', user: { id: user._id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ عرض كل اليوزرز
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// في UserService.js أضف دالة تسجيل مستخدم جديد
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // التحقق من وجود المستخدم مسبقاً
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // إنشاء المستخدم الجديد
    const user = new User({ name, email, password, role });
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      user: { id: user._id, name: user.name, role: user.role } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};