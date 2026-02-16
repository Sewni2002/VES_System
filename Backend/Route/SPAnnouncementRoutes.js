const express = require("express");
const router = express.Router();
const {
  getLatestAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
} = require("../Controllers/SPAnnouncementController");

router.get("/latest", getLatestAnnouncements);
router.get("/all", getAllAnnouncements);
router.post("/create", createAnnouncement);

module.exports = router;
