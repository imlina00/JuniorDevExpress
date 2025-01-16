const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { checkToken, } = require("./middlewares");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/carParkDb", { family: 4 });
const db = mongoose.connection;

db.on("error", (error) => {
  console.error("Error with connection:", error);
});

db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Schemas
const { Schema } = mongoose;

// User schema
const userSchema = new Schema({
  name: String,
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // "admin" or "user"
});
const User = mongoose.model("User", userSchema, "users");

// Car schema
const carSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  carType: { type: String, enum: ["standard", "minivan", "mini"], required: true },
  fuel: { type: String, enum: ["Diesel", "Petrol"], required: true },
  MA_transmission: { type: String, enum: ["Manual", "Automatic"], required: true },
  damaged: { type: Boolean, default: false },
  aviability: {
    isAvailable: { type: Boolean, default: true }, // Changed to 'isAvailable'
  },
  reservations: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  ],
});
const Car = mongoose.model("Car", carSchema, "cars");

// User request schema
const userRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  carType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['approved', 'denied', 'pending'], default: 'pending' },
  carAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Car' }, // New field for assigned car
});
const UserRequest = mongoose.model("UserRequest", userRequestSchema, "userRequests");

// New schema for damage report
const damageReportSchema = new mongoose.Schema({
  carId: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
  damageDescription: { type: String, required: true },
  dateReported: { type: Date, default: Date.now },
});
const DamageReport = mongoose.model('DamageReport', damageReportSchema, 'damageReports');

// Route to report damage
app.post('/report-damage', (req, res) => {
  const { carId, damageDescription } = req.body;

  if (!carId || !damageDescription) {
    return res.status(400).json({ error: 'Molimo unesite sve potrebne podatke!' });
  }

  console.log(`Prijavljena šteta na vozilu ID: ${carId}, Opis: ${damageDescription}`);
  res.status(200).json({ message: 'Prijava štete uspješno zaprimljena!' });
});
app.post('/report-damage', checkToken, (req, res) => {
  // Logika za prijavu štete
  res.json({ message: 'Šteta uspješno prijavljena' });
});

// Route for getting all damage reports for the admin
app.get('/damage-reports', checkToken, async (req, res) => {
  try {
    const reports = await DamageReport.find(); // Fetch all damage reports from DB
    res.status(200).json(reports);
  } catch (err) {
    res.status(500).send('Error fetching damage reports');
  }
});



// Route for updating damage report status
app.put('/damage-reports/:id/status', checkToken, async (req, res) => {
  const { status } = req.body;
  try {
    const updatedReport = await DamageReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).send('Report not found');
    }
    res.status(200).json(updatedReport);
  } catch (err) {
    res.status(500).send('Error updating report status');
  }
});

const checkAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("You do not have permission to access this resource.");
  }
  next();
};
/* app.get("/cars", checkToken, checkAdmin, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied.");
  }

  const cars = await Car.find();
  res.status(200).json(cars);
}); */



// Route to create a new request
app.post("/user-requests", checkToken, async (req, res) => {
  try {
    const { carType, reason, startDate, endDate } = req.body;
    const userId = req.user.id;

    const newRequest = new UserRequest({
      userId,
      carType,
      reason,
      startDate,
      endDate,
    });

    await newRequest.save();
    res.status(201).send("Request successfully submitted.");
  } catch (err) {
    res.status(500).send("Error submitting request: " + err.message);
  }
});


// Login route (unchanged)
app.post("/login", async (req, res) => {
  try {
    const userDb = await User.findOne({ email: req.body.email });
    if (userDb && (await bcrypt.compare(req.body.password, userDb.password))) {
      const token = jwt.sign(
        { id: userDb.id, role: userDb.role }, // Add role to payload
        "secretkey",
        { expiresIn: "1h" }
      );
      res.status(200).send(token);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route for updating request status (admin only)
app.put("/user-requests/:id/status", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status can be 'approved' or 'denied'

    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }

    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).send("Status must be 'approved' or 'denied'");
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).send("Request not found");
    }

    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating status:", err.message);
    res.status(500).send("Error updating status");
  }
});


// Route for user registration
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if all fields are provided
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error during registration:", err.message);
    res.status(500).json({ error: "An error occurred during registration" });
  }
});



// Route for getting all requests (admin only)
// Route for getting requests for a specific user (accessible by both user and admin)
/* app.get("/user-requests/my-requests", checkToken, async (req, res) => {
  try {
    const requests = await UserRequest.find({ userId: req.user.id });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).send("Error fetching user requests");
  }
}); */




// Route to add a new car (admin only)
// Assuming you're expecting an admin to add a car
app.post("/cars", checkToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).send("Access denied. Admins only.");
  }

  try {
    const { brand, carType, fuel, MA_transmission } = req.body;

    const newCar = new Car({
      brand,
      carType,
      fuel,
      MA_transmission,
    });

    await newCar.save();
    res.status(201).send("Car added successfully");
  } catch (err) {
    res.status(500).send("Error adding car: " + err.message);
  }
});


// Route for assigning a car to a request
app.put("/user-requests/assign-car/:requestId", checkToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }

    const { carId } = req.body;

    // Check if the car is available
    const car = await Car.findById(carId);
    if (!car || !car.aviability.isAvailable) {
      return res.status(400).send("Car is not available");
    }

    // Assign car to the request and update car's availability
    const updatedRequest = await UserRequest.findByIdAndUpdate(
      req.params.requestId,
      { carAssigned: carId, status: 'approved' }, // Change status to approved when car is assigned
      { new: true }
    );

    // Update car's availability
    car.aviability.isAvailable = false;
    await car.save();

    res.status(200).json({ message: "Car assigned successfully", updatedRequest });
  } catch (err) {
    console.error("Error assigning car:", err.message);
    res.status(500).send("Error assigning car");
  }
});

// Route for getting all cars (admin only)
app.get("/cars/available-cars", checkToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }

    // Provjerava sve automobile bez filtera dostupnosti
    const cars = await Car.find();

    if (!cars || cars.length === 0) {
      return res.status(404).send("No cars found");
    }

    res.status(200).json(cars);
  } catch (err) {
    console.error("Error fetching cars:", err.message);
    res.status(500).send("Error fetching cars");
  }
});
 //ovo ispod mozda dekomentirat

// Route for getting requests for a specific user
/* app.get("/user-requests/my-requests", checkToken, async (req, res) => {
  try {
    const requests = await UserRequest.find({ userId: req.user.id });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).send("Error fetching user requests");
  }
}); */

// Route for updating request status (admin only)
app.put("/user-requests/:id/status", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // status can be 'approved', 'denied', or 'pending'

    if (req.user.role !== "admin") {
      return res.status(403).send("Access denied. Admins only.");
    }

    if (!['approved', 'denied', 'pending'].includes(status)) {
      return res.status(400).send("Status must be 'approved', 'denied', or 'pending'");
    }

    const updatedRequest = await UserRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).send("Request not found");
    }

    res.status(200).json(updatedRequest);
  } catch (err) {
    console.error("Error updating status:", err.message);
    res.status(500).send("Error updating status");
  }
});

// Route for canceling (deleting) a user request (reservation)
// Route for canceling (deleting) a user request (reservation)
app.delete("/user-requests/:id", checkToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the request by ID
    const request = await UserRequest.findById(id);
    
    if (!request) {
      return res.status(404).send("Reservation not found");
    }

    // Check if the user is the one who made the request
    if (request.userId.toString() !== req.user.id) {
      return res.status(403).send("You can only cancel your own requests.");
    }

    // Delete the reservation
    const deletedRequest = await UserRequest.findByIdAndDelete(id);

    // Optionally, if you want to make the car available again after cancellation:
    const car = await Car.findById(deletedRequest.carAssigned);
    if (car) {
      car.aviability.isAvailable = true;  // Mark the car as available again
      await car.save();
    }

    res.status(200).send("Reservation canceled successfully");
  } catch (err) {
    console.error("Error deleting reservation:", err.message);
    res.status(500).send("Error deleting reservation");
  }
});

// U backend controlleru:
// Pretpostavljamo da je model 'Car' definiran
app.get("/cars/all-cars", async (req, res) => {
  try {
    const cars = await Car.find(); // Koristimo await za dobivanje podataka
    res.status(200).json(cars); // Vraćamo vozila u odgovoru
  } catch (err) {
    res.status(500).json({ message: "Greška pri dohvaćanju vozila", error: err });
  }
});

app.get('/cars', checkToken, (req, res) => {
  Car.find()
    .then((cars) => {
      res.status(200).json(cars);
    })
    .catch((err) => {
      console.error('Greška pri dohvaćanju vozila:', err);
      res.status(500).json({ message: 'Greška pri dohvaćanju vozila' });
    });
});

app.get('/user', checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send('Error fetching user');
  }
});

app.get("/user-requests/my-requests", checkToken, async (req, res) => {
  try {
    // No role check needed here either, as both users and admins can access
    const requests = await UserRequest.find({ userId: req.user.id }); // Fetch requests specific to the user

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).send("Error fetching user requests");
  }
});



// Starting the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

