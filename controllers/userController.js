const db = require('../routes/db').db;
const userRef  = db.ref("User");
const expressValidator= require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports.createUser = (req,res,next) => {
  if(req.method === 'POST'){
    //----------Validation Start-------------
    req.checkBody('username','Username field cannot be empty').notEmpty();
    req.checkBody('username','Username must be between 4-15 characters long.').len(4,15);
    req.checkBody('email' , 'the email you entered is invalid, please try again.').isEmail();
    req.checkBody('email' , 'Email address must be between 4-100 characters long, please try again.').len(4,100);
    req.checkBody('password','Password must be between 8-100 characters long').len(8,100);
    req.checkBody('password',"Password must include one lowercase character,one uppercase character, a number ,and a special character. ").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z)-9]).{8,}$/,"i");
    req.checkBody('passwordMatch','Password must be between 8-100 characters long.').len(8,100);
    req.checkBody('passwordMatch','Passwords do not match, please try again.').equals(req.body.password);
    req.checkBody('nationalId','National Identity field cannot be empty').notEmpty();
    req.checkBody('nationalId','National Identity must be  14 digits, please try again').isLength(14);

    
    const errs     = req.validationErrors();
    if(errs){
      let userErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'username': userErrs.username =errs[i].msg; break;
          case 'password': userErrs.password =errs[i].msg; break;
          case 'passwordMatch': userErrs.passwordMatch =errs[i].msg; break;
          case 'email': userErrs.email = errs[i].msg; break;
          case 'nationalId': userErrs.nationalId =errs[i].msg; break;
        }
      }
       res.render('user/registration',{
        title: "Registeration error",
         errors : errs,
         usernameErr:userErrs.username,
         passwordErr:userErrs.password,
         passwordMatchErr:userErrs.username,
         emailErr:userErrs.username,
         nationalIdErr:userErrs.username,
       });
    }
    else{
      //password Validation and hashing
      bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
        if(err) console.log(err);
        //----Save in Firebase----
    
        let userObj = {
           fullName    : req.body.username,
           password    : hash,
           email       : req.body.email,
           birthday    : req.body.birthday,
           nationalId  : req.body.nationalId, 
           gender      : req.body.gender,
        };

        userRef.once("value").then((snapshot)=> {
          snapshot.forEach((childSnapshot) =>{
            
            const childData = childSnapshot.val();
            if(childData.nationalId === userObj.nationalId){
              userObj.idErr = "National Id Already Exists!";
              res.render('user/registration',{
              title : " National Id Already Exists Error",
              idErr : userObj.idErr,
            authenticated: req.session.authenticated});
            }  
          });
          if(typeof(userObj.idErr) === 'undefined'){
             userRef.push(userObj).catch((err)=>{
                  console.log(err);
             });
          res.redirect('/tables');
          }
        });
     }); 
   }
   } 
  else{
    // render the user form
    res.render('user/registration',{title : "User Registeration",authenticated: req.session.authenticated});

  }
};

module.exports.updateUser = (req,res,next)=>{
  let user_id =  req.params.id;
  if (req.method === 'POST') {
    req.checkBody('username','Username field cannot be empty').notEmpty();
    req.checkBody('username','Username must be between 4-15 characters long.').len(4,15);
    req.checkBody('email' , 'the email you entered is invalid, please try again.').isEmail();
    req.checkBody('email' , 'Email address must be between 4-100 characters long, please try again.').len(4,100);
    req.checkBody('password','Password must be between 8-100 characters long').len(8,100);
    req.checkBody('password',"Password must include one lowercase character,one uppercase character, a number ,and a special character. ").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z)-9]).{8,}$/,"i");
    req.checkBody('nationalId','National Identity field cannot be empty').notEmpty();
    req.checkBody('nationalId','National Identity must be  14 digits, please try again').isLength(14);
    const errs     = req.validationErrors();
    if(errs){
      let userErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'username': userErrs.username =errs[i].msg; break;
          case 'password': userErrs.password =errs[i].msg; break;
          case 'passwordMatch': userErrs.passwordMatch =errs[i].msg; break;
          case 'email': userErrs.email = errs[i].msg; break;
          case 'nationalId': userErrs.nationalId =errs[i].msg; break;
        }
      }
       res.render('user/update_user',{
        title: "Validation Errors",
         errors : errs,
         usernameErr:userErrs.username,
         passwordErr:userErrs.password,
         passwordMatchErr:userErrs.username,
         emailErr:userErrs.username,
         nationalIdErr:userErrs.username,
         authenticated: req.session.authenticated
       });
    }
    else{
      //password Validation and hashing
      bcrypt.hash(req.body.password,saltRounds,(err,hash)=>{
        if(err) console.log(err);
        //----Save in Firebase----
    
        let userObj = {
          fullName    : req.body.username,
          password    : hash,
          email       : req.body.email,
          birthday    : req.body.birthday,
          nationalId  : req.body.nationalId, 
          gender      : req.body.gender,
       };

        userRef.child(user_id).update(userObj).catch((err)=>{
          console.log(err);
     });
       res.redirect('/tables');
        // userRef.child(user_id).update(userObj);
        
        //national id Validation
        //cridit card Validation
        //----------Validation End---------------
        //----redirect to --->
     }); 
   } 
  } else {
    userRef.child(user_id).once('value').then((dataSnap)=>{
      if(dataSnap.exists()){
        let userObj  = dataSnap.val();
        userObj.birthday.day = String(userObj.birthday.day).length < 2 ? '0'+ String(userObj.birthday.day):userObj.birthday.day; 
        userObj.birthday.month = String(userObj.birthday.month).length < 2 ? '0'+ String(userObj.birthday.month):userObj.birthday.month; 
       
        console.log(userObj);
        res.render('user/update_user',{title : userObj.fullName , userObj : userObj});
      } else throw new Error(); 
    }).catch((err)=>{
      console.log("Error Getting info from database " + err);
      res.render('user/update_user',{title : "Not Found In Database ",authenticated: req.session.authenticated});

    });
    
  }

};
module.exports.deleteUser = (req,res,next)=>{
  let user_id =  req.params.id;
  userRef.child(user_id).remove();
  res.redirect('/tables');
};
