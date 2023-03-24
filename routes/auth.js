const express=require('express');
const User = require('../models/User');
const router=express.Router()
const { body, validationResult } = require('express-validator');
const { findOne } = require('../models/User');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = "authenticationSignature01"


// Create a user using: Post "/api/auth/createuser" .No login required
router.post('/createuser',[
    body('name').isLength({min:3}),
    body('email').isEmail(),
    body('password').isLength({min:5})
], async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        
   
    let user = await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({error:"sorry user with this email already exist"});
    }

    const salt = await bcrypt.genSaltSync(10);
    const secPass = await bcrypt.hashSync(req.body.password, salt);
    
    
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
    const authToken=jwt.sign(data,JWT_SECRET);
  res.json({authToken})

} catch (error) {
        console.error(error.message);
        res.status(500).send("some error occured");
}
})

module.exports=router