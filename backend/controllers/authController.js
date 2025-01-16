const jwt = require('jsonwebtoken');

exports.loginUser = (req, res) => {
  const { username, password } = req.body;

  // Validacija korisnika (mock)
  const isValidUser = username === 'admin' && password === 'password123'; // Ovdje koristi bazu
  const role = username === 'admin' ? 'admin' : 'user';

  if (!isValidUser) {
    return res.status(401).json({ message: 'Nevažeći podaci za prijavu' });
  }

  // Generiranje tokena
  const token = jwt.sign({ username, role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};
