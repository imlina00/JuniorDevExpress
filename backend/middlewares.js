const jwt = require('jsonwebtoken');

// Middleware za provjeru JWT tokena
function checkToken(req, res, next) {
  // Dohvati Authorization header i izdvoji token
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Ako nema tokena, vrati grešku
    return res.status(401).json({ error: 'Pristup odbijen. Nije dostavljen token.' });
  }

  try {
    // Verificiraj token pomoću JWT tajnog ključa
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Dodaj podatke korisnika u zahtjev
    next(); // Nastavi s obradom zahtjeva
  } catch (err) {
    // Ako je token neispravan ili istekao
    res.status(403).json({ error: 'Neispravan token.' });
  }
}

// Middleware za provjeru administratorske uloge
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    // Ako korisnik ima administratorsku ulogu, nastavi dalje
    next();
  } else {
    // Ako korisnik nema administratorsku ulogu, vrati grešku
    res.status(403).json({ error: 'Pristup odbijen. Samo za administratore.' });
  }
}

// Middleware za provjeru uloge korisnika (opcionalno, ako je potrebno)
function isUser(req, res, next) {
  if (req.user && req.user.role === 'user') {
    // Ako je uloga "user", nastavi dalje
    next();
  } else {
    // Ako nije, vrati grešku
    res.status(403).json({ error: 'Pristup odbijen. Samo za korisnike.' });
  }
}

// Izvoz middleware funkcija
module.exports = {
  checkToken,
  isAdmin,
  isUser,
};
