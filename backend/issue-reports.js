const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const { Schema } = mongoose;

const IssueReportSchema = new Schema({
  carId: { type: Schema.Types.ObjectId, ref: "Car" },
  submissioner_id: { type: Schema.Types.ObjectId, ref: "Car" },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" },
});

const IssueReport = mongoose.model(
  "IssueReport",
  IssueReportSchema,
  "issue-reports"
);

router.get("/", async (req, res) => {
  try {
    const reports = await IssueReport.find();
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/", async (req, res) => {
  const newReport = new IssueReport(req.body);
  try {
    await newReport.save();
    res.status(201).send("Report successfully added to database");
  } catch (error) {
    res.status(500).send(err.message);
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Find and delete the report by its ID
    const deletedReport = await IssueReport.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Damage report not found" });
    }

    res.status(200).json({
      message: "Damage report deleted successfully",
      report: deletedReport,
    });
  } catch (error) {
    console.error("Error deleting damage report:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
});
router.patch("/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const updates = req.body;

  try {
    // Update the car with the dynamic fields
    const updatedReport = await IssueReport.findByIdAndUpdate(
      reportId,
      updates, // Directly apply the fields from the request body
      { new: true, runValidators: true } // Return updated document and validate fields
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({
      message: "Report updated successfully",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

module.exports = router;
