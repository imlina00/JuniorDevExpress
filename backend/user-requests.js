const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { checkToken } = require("./middlewares");
const UserRequest = require("./user-request.model");

router.post("/", checkToken, async (req, res) => {
  const id = req.user.id;

  const newRequest = new UserRequest({ ...req.body, requester: id });
  try {
    await newRequest.save();
    res.status(201).send("Request successfully added to database");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Get request by id for user
router.get("/my-requests", checkToken, async (req, res) => {
  const userRequests = await UserRequest.find({ requester: req.user.id });
  res.status(200).json(userRequests);
});

// Get all requests for admin
router.get("/all-requests", async (req, res) => {
  const userRequests = await UserRequest.find({ status: "pending" }).populate();
  res.status(200).json(userRequests);
});

router.patch("/deny-request", async (req, res) => {
  try {
    const userRequest = await UserRequest.findByIdAndUpdate(req.body.req_id, {
      status: req.body.status,
    });
    if (userRequest) {
      console.log("Request successfully updated");
      res.status(200).send("Request successfully updated");
    } else {
      res.status(404).send("Request not found");
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

router.patch("/approve-request", async (req, res) => {
  const { req_id, status, car_id } = req.body;

  // Validate incoming data
  if (!req_id || !status || !car_id) {
    return res
      .status(400)
      .send("Missing required fields: req_id, status, or car_id");
  }

  try {
    // Find and update the UserRequest by ID
    const userRequest = await UserRequest.findByIdAndUpdate(
      req_id,
      { status: status, assigned_car_id: car_id }, // Update status and assigned_car_id
      { new: true } // Return the updated document
    );

    if (userRequest) {
      res.status(200).json({
        message: "Request successfully updated",
        updatedRequest: userRequest,
      });
    } else {
      res.status(404).json({ message: "Request not found" });
    }
  } catch (err) {
    console.error("Error updating request:", err);
    res.status(500).json({ message: "An error occurred", error: err.message });
  }
});

module.exports = router;
