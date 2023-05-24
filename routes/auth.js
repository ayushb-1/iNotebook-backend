const express=require('express');
const User = require('../models/User');
const router=express.Router()
const { body, validationResult } = require('express-validator');


const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "authenticationSignature01";

const fetchUser = require('../middleware/fetchUser')


// Route 1: Create a user using: Post "/api/auth/createuser" .No login required
router.post('/createuser',[
    body('name').isLength({min:3}),
    body('email').isEmail(),
    body('password').isLength({min:5})
], async(req,res)=>{
    let success = false;
    // if there are errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        
//    if the user already exist
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({success,error:"sorry user with this email already exist"});
    }

    // generating hashing password
    const salt = await bcrypt.genSaltSync(10);
    const secPass = await bcrypt.hashSync(req.body.password, salt);
    
    // creating new user
    user = await User.create({
        name: req.body.name,
        email:req.body.email,
        password: secPass
    })
    
    const data={
        user:{
            id: user.id
        }
    }
    success=true;
    const authtoken=jwt.sign(data,JWT_SECRET);
  res.json({success,authtoken})

} catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
}
})



// Router 2: Authenticate a User using - Post "api/auth/login" no login required 
router.post('/login',[
   
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannont be blank').exists()
], async(req,res)=>{
    
    let success=false;
    // if there are errors 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} =  req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Please try to login with correct credentialsails"});
        }
        const comparePass = await bcrypt.compare(password, user.password);
        if(!comparePass){
            
            return res.status(400).json({success,error: "Please try to login with correct credentials"});
        }
        const data={
        user:{
            id: user.id
        }
    }
    success=true;
    const authtoken=jwt.sign(data,JWT_SECRET);
    res.json({success,authtoken})
 
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})



// Route 3: Get loggedin User using -Post "api/auth/getuser" login required
router.post('/getuser',fetchUser, async(req,res)=>{

    try {
        userId=req.user.id;
        let user= await User.findById(userId).select("-password");
        res.send(user);
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})
module.exports=router