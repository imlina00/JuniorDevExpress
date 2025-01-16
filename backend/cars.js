const express = require("express");
const mongoose = require("mongoose");
const UserRequest = require("./user-request.model");
const router = express.Router();

const { Schema } = mongoose;
const { ObjectId } = mongoose.Types;

const CarSchema = new Schema({
  brand: { type: String, required: true },
  carType: { type: String, required: true },
  fuel: { type: String, required: true },
  MA_transmission: { type: String, required: true },
  damaged: { type: Boolean, default: false },

  aviability: {
    isAvailable: {
      type: Boolean,
      default: true,
      description: { type: String },
    },
  },
  reservations: [
    {
      startDate: { type: Date },
      endDate: { type: Date },
      requester_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      request_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserRequest",
        required: true,
      },
    },
  ],
});
const Car = mongoose.model("Car", CarSchema, "cars");

// filter cars by type and start and end time
router.get("/available", async (req, res) => {
  const { carType, startDate, endDate } = req.query;

  if (!carType || !startDate || !endDate) {
    return res.status(400).json({ message: "Missing required parameters." });
  }

  try {
    // first find cars by car type
    const cars = await Car.find({ carType, "aviability.isAvailable": true });

    if (cars.length === 0) {
      console.log(`No cars with car type: ${carType}`);
      return res
        .status(200)
        .json({ message: "No cars available for selected car type." });
    } else {
      // if car type exists then check dates
      const availableCars = cars.filter((car) => {
        const overlappingReservation = car.reservations.some((reservation) => {
          return (
            new Date(startDate) < reservation.endDate &&
            new Date(endDate) > reservation.startDate
          );
        });

        return !overlappingReservation; // Include cars with no overlap
      });
      if (availableCars.length === 0) {
        res
          .status(200)
          .json({ message: "No cars available for the selected dates." });
      } else {
        res.status(200).json({ availableCars });
      }
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching available cars." });
  }
});

router.get("/unavailable", async (req, res) => {
  try {
    const damagedCars = await Car.find({ available: false });
    res.status(200).json(damagedCars);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "An error occurred while fetching damaged cars." });
  }
});

router.patch("/approve", async (req, res) => {
  const { startDate, endDate, requester_id, request_id, car_id } = req.body;

  if (!startDate || !endDate || !requester_id || !car_id || !request_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const car = await Car.findById(car_id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const newReservation = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      requester_id: requester_id, // Ensure ObjectId
      request_id: request_id,
    };

    car.reservations.push(newReservation);
    await car.save();
    res.status(200).json({ message: "Reservation added successfully", car });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while adding the reservation" });
  }
});

router.delete("/delete-pending-req", async (req, res) => {
  const { reservation_id } = req.body;
  if (!reservation_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    if (!ObjectId.isValid(reservation_id)) {
      return res
        .status(400)
        .json({ message: "Invalid car_id or reservation_id." });
    }
    const deletedRequest = await UserRequest.findByIdAndDelete(
      new ObjectId(reservation_id)
    );
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found." });
    }
    res.status(200).json({
      message: "Reservation successfully cancelled.",
      deletedRequest,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      message: "An error occurred while cancelling the reservation.",
    });
  }
});

router.delete("/delete-approved-req", async (req, res) => {
  const { car_id, reservation_id } = req.body;

  if (!car_id || !reservation_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    // Validate ObjectId fields
    if (!ObjectId.isValid(car_id) || !ObjectId.isValid(reservation_id)) {
      return res
        .status(400)
        .json({ message: "Invalid car_id or reservation_id." });
    }

    // Step 1: Delete the request document
    const deletedRequest = await UserRequest.findByIdAndDelete(
      new ObjectId(reservation_id)
    );
    if (!deletedRequest) {
      return res.status(404).json({ message: "Request not found." });
    }

    // Step 2: Remove the reservation
    const updatedCar = await Car.findByIdAndUpdate(
      new ObjectId(car_id), // Use new ObjectId
      { $pull: { reservations: { request_id: new ObjectId(reservation_id) } } },
      { new: true }
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found." });
    }

    res.status(200).json({
      message: "Reservation successfully cancelled.",
      deletedRequest,
      updatedCar,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({
      message: "An error occurred while cancelling the reservation.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const newCar = new Car(req.body);
    await newCar.save();
    res.status(201).send("Car successfully added to database");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// router.get("/", async (req, res) => {
//   const { carId } = req.query; // Access query parameters

//   if (!carId) {
//     return res.status(404).json({ message: "Car not found." });
//   }

//   try {
//     const car = await Car.findById(carId);

//     if (!car) {
//       return res.status(404).json({ message: "Car not found." });
//     }

//     res.status(200).json(car); // Respond with the found car
//   } catch (err) {
//     res.status(500).send(err.message);
//   }
// });

router.get("/", async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "An error occurred while fetching cars." });
  }
});

router.get("/:carId", async (req, res) => {
  try {
    const car = await Car.findById(req.params.carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: "Error fetching car details", error });
  }
});
router.patch("/:carId", async (req, res) => {
  const { carId } = req.params;
  const updates = req.body;

  try {
    // Update the car with the dynamic fields
    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      updates, // Directly apply the fields from the request body
      { new: true, runValidators: true } // Return updated document and validate fields
    );

    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({
      message: "Car updated successfully",
      car: updatedCar,
    });
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
