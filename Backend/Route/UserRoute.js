
const express = require("express");

const router = express.Router();

const User = require("../Model/UserModel");

const UserController = require("../Controlers/UserControl");

router.get("/",UserController.getAllUsers);
router.post("/",UserController.addUsers);

//get by id
router.get("/:id",UserController.getById);
//update----put apply for update
router.put("/:id",UserController.updateUser);
//delete
router.delete("/:id",UserController.deleteUser);


module.exports = router;