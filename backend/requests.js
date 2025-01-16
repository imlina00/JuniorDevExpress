const express = require('express');
const Request = require('../models/Request');
const router = express.Router();

// GET ruta za dohvat svih zahtjeva
router.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Greška pri dohvaćanju zahtjeva' });
  }
});

module.exports = router;
