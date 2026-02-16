const User = require("../Model/UserModel");

const getAllUsers= async(req , res,next) =>{

    let Users;
    
    try{
        Users = await User.find();
    }catch(err){
        console.log(err);
    }


    //no users
    if(!Users){
        return res.status(404).json({message:"No users"});
    }

    //display

    return res.status(200).json({Users});

};



const addUsers = async(req , res,next) =>{

    const {name ,  email} = req.body;
    
    let users;

    try{
        users =  new User({name, email});

        await users.save();
    }catch(err){
        console.log(err);
    }


    //not inset users
    if(!users){
        return res.status(404).send({message: "unable to add users"});

    }

            return res.status(200).json({users});



};



//get by id
const getById = async(req,res,next) =>{
    const id  = req.params.id;

    let user;

    try{

        user = await User.findById(id);
    }catch(err){
        console.log(err);
    }


      if(!user){
        return res.status(404).send({message: "User Not found"});

    }

            return res.status(200).json({user});


}




//update

const updateUser = async(req,res,next) =>{
    const id  = req.params.id;

    const {name ,  email} = req.body;

    let users;

    try{
        users = await User.findByIdAndUpdate(id, {name : name ,email : email });

        users = await users.save();
    }catch(err){
        console.log(err);
    }


      if(!users){
        return res.status(404).send({message: "User Not found to update"});

    }

            return res.status(200).json({users});



}


const deleteUser = async(req , res , next) => {
        const id  = req.params.id;

        let user;

        try{
            user = await User.findByIdAndDelete(id);

        }catch(err){
            console.log(err);
        }

          if(!user){
        return res.status(404).send({message: "User Not found to delete"});

         }

            return res.status(200).json({user});

}

exports.getAllUsers = getAllUsers;

exports.addUsers = addUsers;
exports.getById = getById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;