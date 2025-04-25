express=require('express');
router=express.Router();
const { validate, ValidationError, Joi } = require('express-validation');
const User = require('../modules/Auth');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config({path:'.env.local'});
const fetchuser=require('../middleware/fetchuser');

const jwtkey=process.env.JWTKEY;
var jwttoken;

// validation using joi object
const SignupValidation = {
    body: Joi.object({
      name: Joi.string().min(3).required(),
      password:Joi.string().required().messages({'string.empty':'Enter your password'}),
      cpassword:Joi.string().required().valid(Joi.ref('password')).messages({'string.empty':'Enter your correct password','any.only':'Password must match'}),
      email:Joi.string().email().required().messages({'string.email':'Enter correct format email','string.empty':'Enter your email'}),
    }),
  }

const loginValidation={
  body: Joi.object({
      password:Joi.string().required().messages({'string.empty':'Enter your password'}),
      email:Joi.string().email().required().messages({'string.email':'Enter correct format email','string.empty':'Enter your email'}),
    }),
}

// For creating new user.
router.post(('/create'),validate(SignupValidation, {}, {}), async (req, res)=>{

    // creating new user with encrypted password using bcryptjs
    // Error in index.js
    if(req.body.cpassword!==req.body.password){
      return res.status(403).json({error:"Confirm password does not match"});
    }
    const encryptedPassword=await bcrypt.hash(req.body.password,saltRounds);
    User.create({
        name: req.body.name,
        email:req.body.email,
        password:encryptedPassword,
      }).then((user)=>{
        console.log("User saved");
        res.status(201).json(user);

        // creating payload for jwt
        const data={
          user:{
            id:user.id,
          }
        }
        

        // creating jwt token to send to client
        jwttoken=jwt.sign(data, jwtkey);
        console.log(jwttoken);




    }).catch((e)=>{
      console.error("Error during save:", e); // Log the full error
      res.status(400).json({ "Error": e.message });
    });
    // res.send("User saved");
    console.log(req.body);

    
})

//Login for existing user.
router.post('/login',validate(loginValidation,{},{}),async (req,res)=>{
  try{
    const user=await User.findOne({email:req.body.email});
    if(!user)
    {
      return res.status(404).json("User not found");
    }

    //For unknown reasons await was not working for compare() so a new promise is created to handle promise.
    const isPasswordValid = await new Promise((resolve,reject)=>{
      bcrypt.compare(req.body.password,user.password,function(err,yeah){
        if(err)
          reject(err)
        resolve(yeah)
      });
    })

    if(!isPasswordValid)
    {
      return res.status(400).json("User not found");
    }
    // creating payload for jwt
    const data={
      user:{
        id:user.id,
      }
    }

    // creating jwt token to send to client
    jwttoken=jwt.sign(data, jwtkey);
    console.log(user);
    return res.status(200).json({token:jwttoken});

  } 
  catch(e){
    console.log(e);
    return res.status(500).json({message:"Internal server error"});
  }
});

router.post('/verification',fetchuser,async (req,res)=>{
  try{
    const user=await User.findById(req.user.id);
    if(!user)
    {
      return res.status(404).send("Not found");
    }
    res.status(200).json(user);
  }
  catch(e){
    res.status(500).send("Something wrong");
  }
});

module.exports=router;