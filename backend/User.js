// Dodaj u backend/models/User.js (ako koristiš Mongoose za modeliranje korisnika)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },  // Dodaj role polje
});

const User = mongoose.model('User', userSchema);
module.exports = User;
