const express = require('express');
require('dotenv').config();

let router = express.Router();


const {User} = require('../../models/user_model');
const { checkLoggedIn } = require('../../middlewares/auth');
const { grantAccess } = require('../../middlewares/roles');


//Sign Up
router.route("/register")

.post(async (req,res)=>{
    try{
    //1check if email taken
    if(await User.emailTaken(req.body.email)){
        return res.status(400).json({message: 'Sorry Email taken'})
    }

    //2 creating the model(hash pass)
        const user = new User({
            email: req.body.email,
            password: req.body.password,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            role:req.body.role
        });
    ///3 generate token 
        const token = user.genrateToken()
        const doc = await user.save();
    ///4 send email

    // save... send token with cookie
        res.cookie('x-access-token', token)
        .status(200).send(getUserProps(doc));
    } catch(error){
        console.log(error);
        res.status(400).send({message:'Error',error:error})
        
    }


})

//sign In

router.route("/signin")
.post(async (req,res)=>{
    try {
        // Find User
        let user = await User.findOne({email:req.body.email})
        if (!user) return res.status(400).json({message:"Bad email"})

        // Compare email is valid or not
        const compare = await user.comparePassword(req.body.password);
        if(!compare) return res.status(400).json({message:'Password is wrong'})

        // Generate Token
        const token = user.genrateToken();

        //Response
        res.cookie('x-access-token', token)
        .status(200).send(getUserProps(user));
    } catch (error) {
        console.log(error);
        res.status(400).send({message:'Error',error:error})
        
    }
})


//profile
router.route("/profile")
.get(checkLoggedIn,grantAccess('readOwn','profile'), async (req,res)=>{
   try {
    
    const permission = res.locals.permission;
         
    const user = await User.findById(req.user._id);
    if(!user) return res.status(400).json({message: 'Uer not found'});

    res.status(200).json(permission.filter(user._doc));
   } catch (error) {
    
    return res.status(400).send(error);
   }
})
.patch(checkLoggedIn,grantAccess('updateOwn', 'profile'),async(req, res)=>{
    try {
        const user = await User.findOneAndUpdate(
            {_id: req.user._id},
            {
                "$set":{
                    firstname: req.body.firstname,
                    lastname: req.body.lastname,
                    age: req.body.age
                }
            },
            {new : true}
        );
        if(!user) return res.status(400).json({message:'User not found'});
        res.status(200).json(getUserProps(user));
    } catch (error) {
        res.status(400).json({message:"Problem updating",error:error});
        
    }
})

router.route("/update_email")
.patch(checkLoggedIn, grantAccess('updateOwn', 'profile'), async(req,res)=>{
    try {
        // 1 check it email taken
        if(await User.emailTaken(req.body.newemail)){
            return res.status(400).json({message:"email is taken"})
        }

        // 2 create the model (hash password)
        const user = await User.findOneAndUpdate(
            {_id: req.user._id, email:req.body.email},
            {
                "$set":{
                    email:req.body.newemail
                }
            },
            {new:true}
        )
        if(!user) return res.status(400).json({message:'User not found'});

        const token = user.genrateToken();
        res.cookie('x-access-token',token)
        .status(200).send({email:user.email});
    } catch (error) {

        res.status(400).json({message:"Problem updating",error:error});
        
    }
})

router.route('/isauth')
.get(checkLoggedIn,async(req, res)=>{
    res.status(200).send(getUserProps(req.user))
})



const getUserProps = (user)=>{
    return {
        _id: user._id,
        email: user.email,
        // password:user.password,
        firstname: user.firstname,
        lastname: user.lastname,
        age: user.age,
        role: user.role

    }
}
module.exports = router;