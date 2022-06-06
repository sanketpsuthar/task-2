const express = require('express');
const app= express();
const User = require('./models/users');                                                                                                                               
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var crypto= require('crypto');
var key= "password";
var algo='aes256';
//JWT token
const jwt = require('jsonwebtoken');
const { error } = require('console');
jwtKey="jwt";
const { body, validationResult } = require('express-validator');
mongoose.connect('mongodb+srv://greninja:9909489075%40Sp@cluster0.pv3pg.mongodb.net/example?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(()=>{
    console.warn("connected");
})
//register
app.post("/register",jsonParser,function(req,res){
    var cipher= crypto.createCipher(algo,key);
    var encrypted= cipher.update(req.body.password,'utf8','hex')
    +cipher.final('hex');
    // console.warn(req.body,encrypted);
    const data=new User({
        _id: mongoose.Types.ObjectId(),
        name:req.body.name,
        email:req.body.email,
        address:req.body.address,
        password:encrypted
    });
    User.find({
            email:req.body.email
        }).then(user => {
            if (user.length > 0) {
                return res.send('Email already in use');
            }
            else{
                data.save().then(() => {
                    res.send("Account Created")  
            })
            }
        })
    })

//Login
app.post("/login",jsonParser,function(req,res){
    User.find({
        email:req.body.email
    }).then(user => {
        if (user.length > 0) {
            User.findOne({email:req.body.email}).then((data)=>{
                var decipher=crypto.createDecipher(algo,key);
                var decrypted= decipher.update(data.password,'hex','utf8')
                +decipher.final('utf8');
                if(decrypted==req.body.password)
                {
                    jwt.sign({data},jwtKey,(err,token)=>{
                        res.status(200).json({token})
                    })
                }
                else{
                    res.send("Password is wrong")
                }
                 }
                )
        }
        else{
                res.send("Email doesnot exist")  
       
        }
    })
    
})
//Get data
app.get("/users",verifyToken,function(req,res){
    User.find().then((result)=>{
    res.status(200).json(result)
    })
})
function verifyToken(req,res,next){
    const bearerHeader=req.headers['authorization'];
    
    
    if(typeof bearerHeader !=='undifined')
    {
        const bearer = bearerHeader.split(' ');
        // console.warn(bearer[1])
        req.token=bearer[1]
        jwt.verify(req.token,jwtKey,(err,authData)=>{
            if(err){
                res.json({result:err})
            }
            else{
                next();
            }
        })
    }
    else{
        res.send({"result":"Token Not Provied"})
    }
}
app.listen(5000);