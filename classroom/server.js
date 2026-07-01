const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session=require("express-session");
const flash = require('connect-flash');

app.use(flash());

const sessionOptions={
    secret:"thisisasecret",
    saveUninitialized:true,
    resave:true
}

app.use(session(sessionOptions));
app.get("/register",(req,res)=>{
   let{name="anonymous"} =req.query;
   req.session.name=name;
   req.flash("success","you have registered successfully");
   res.redirect("/hello");
})
app.get("/hello",(req,res)=>{
    res.send(`hello ${req.session.name}`);
})
app.listen(8080, () => {
  console.log("server listening on 8080");
})