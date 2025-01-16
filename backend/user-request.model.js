const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserRequestSchema = new Schema({
  name: String,
  email: { type: String, required: true },
  carType: { type: String, required: true },
  reason: { type: String, required: true },
  status: { type: String, default: "pending" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  requester: { type: Schema.Types.ObjectId, ref: "User" },
  assigned_car_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Car",
    default: null,
  },
});
const UserRequest = mongoose.model(
  "UserRequest",
  UserRequestSchema,
  "user-requests"
);

module.exports = UserRequest;
