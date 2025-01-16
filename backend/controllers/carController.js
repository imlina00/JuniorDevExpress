const Car = require('../models/car');

// Dohvat svih vozila
exports.getAllCars = async (req, res) => {
  try {
    const cars = await Car.find();
    res.json(cars);
  } catch (err) {
    res.status(500).json({ message: 'Greška pri dohvaćanju vozila' });
  }
};

// Dodavanje novog vozila
exports.addCar = async (req, res) => {
  const { make, model, year } = req.body;

  try {
    const newCar = new Car({ make, model, year });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ message: 'Greška pri dodavanju vozila' });
  }
};

// Ažuriranje vozila
exports.updateCar = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedCar = await Car.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedCar) return res.status(404).json({ message: 'Vozilo nije pronađeno' });
    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ message: 'Greška pri ažuriranju vozila' });
  }
};
