const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICTopicController");

// /api/topics
router.post("/",    ctrl.createTopic);
router.get("/",     ctrl.getTopics);
router.get("/:id",  ctrl.getTopic);
router.put("/:id",  ctrl.updateTopic);
router.delete("/:id", ctrl.deleteTopic);

module.exports = router;
