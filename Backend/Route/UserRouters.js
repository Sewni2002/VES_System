//import express ,model,controler
const express = require("express");
const router = express.Router();
//insert model
const User = require("../Model/UserModel");
//insert user controller
const UserController = require("../Controlers/UserControl");

//create route path
router.get("/",UserController.getAllUsers);
router.post("/",UserController.addUsers);
router.get("/:id",UserController.getById);//id catch details and display
router.put("/:id",UserController.updateUser);//id catch details and display
router.delete("/:id",UserController.deleteUser);//id catch details and display


//export
module.exports = router;