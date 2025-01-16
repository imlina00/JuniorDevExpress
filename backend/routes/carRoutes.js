const express = require('express');
const { getAllCars, addCar, updateCar } = require('../controllers/carController');
const { checkToken, isAdmin } = require('../middleware/middlewares');

const router = express.Router();

// Rute za vozila
router.get('/', checkToken, getAllCars);
router.post('/', checkToken, isAdmin, addCar);
router.put('/:id', checkToken, isAdmin, updateCar);

module.exports = router;
