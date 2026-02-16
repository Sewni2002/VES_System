const express = require("express");
const router = express.Router();
const ctrl = require("../Controllers/LICInstructionController");

router.post("/", ctrl.createInstruction);
router.get("/", ctrl.getInstructions);
router.get("/:id", ctrl.getInstruction);
router.put("/:id", ctrl.updateInstruction);
router.delete("/:id", ctrl.deleteInstruction);

module.exports = router;
