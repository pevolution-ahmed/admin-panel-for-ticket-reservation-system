const db = require('../routes/db').db;
const classRef  = db.ref("Class");
const stadiumRef  = db.ref("Stadium");
const expressValidator= require('express-validator');


module.exports.createClassPhase1 = (req,res,next) => {
  if(req.method === 'POST'){
    //----------Validation Start-------------
    req.checkBody('className','classname field cannot be empty').notEmpty();
    req.checkBody('stadiumName','classname field cannot be empty').notEmpty();

    const errs     = req.validationErrors();
    if(errs){
      let classErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'className': classErrs.classname =errs[i].msg; break;
          case 'stadiumName': classErrs.stadiumName =errs[i].msg; break;    
        }
      }
      console.log(errs[0]);
       res.render('class/add_class_form',{
        title: "Registeration error",
         errors : errs,
         classNameErr:classErrs.classname,
         stadiumNameErr:classErrs.password,
         authenticated : true
       });
    }
    else{
        req.session.className   = req.body.className;
        req.session.stadiumName = req.body.stadiumName;
        req.session.blockCount  = req.body.blockCount;
        stadiumRef.child(req.body.stadiumName).once("value").then((dataSnapshot)=>{          
          req.session.blockCapcity = Number( dataSnapshot.val().Capacity / req.session.blockCount );
          req.session.stadiumGateNum = dataSnapshot.val().NumberOfGates;
          res.redirect('/main/class/create/b');

        });  
    }
  }
  else{
    
    // render the class form
    res.render('class/add_class_form',{title : "Class Registeration"});

  }
};
module.exports.createClassPhase2 = (req,res,next) => {
  if(req.method === 'POST'){
    //----------Validation Start-------------

    req.checkBody('seats',`seats can not be more than ${req.session.blockCapcity}`).isInt({max: req.session.blockCapcity});
    req.checkBody('gateNumber',`Gate Number can not be more than ${req.session.stadiumGateNum}`).isInt({max: req.session.stadiumGateNum});
    
    const errs     = req.validationErrors();
    if(errs){
      let classErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'seats': classErrs.seats =errs[i].msg; break;
          case 'gateNumber': classErrs.gateNumber =errs[i].msg; break;
        }
      }
      console.log(errs[0]);
       res.render('class/add_class_form2',{
        title: "Registeration error",
         errors : errs,
         seatsErr:classErrs.seats,
         gateNumErr:classErrs.gateNumber,
         
       });
    }
    else{
       let blockCount = Number(req.session.blockCount);
       if(blockCount !== req.session.blockDone){
        classRef.child(req.session.classId).child("blocks").push({
          blockNumber : req.body.blockNumber,
          seats       : toNumbers(Number(req.body.seats)),
          gateNumber  : req.body.gateNumber
        });
        req.session.blockDone++;
        res.render('class/add_class_form2',{title : "Block "+(req.session.blockDone) , authenticated : true      });

       }
       else{
        classRef.child(req.session.classId).child("blocks").push({
          blockNumber : req.body.blockNumber,
          seats       : toNumbers(Number(req.body.seats)),
          gateNumber  : req.body.gateNumber

        });
        if(typeof(req.session.blockDone) !== 'undefined' && typeof(req.session.blockCount) !== 'undefined' ){
        req.session.blockDone = undefined;       
        req.session.blockCount = undefined;  
        req.session.classId    = undefined;  
        }

        res.redirect('/tables');
       }
    }
  }
  else{
       
      if(typeof(req.session.classId ) === 'undefined'){
        let classObj = {
        className  : req.session.className,
        stadiumName: req.session.stadiumName
        };
        req.session.classId = classRef.push(classObj).key;

       }
      if(typeof(req.session.blocks) === 'undefined'){
        req.session.blocks = {};
       }
       if(typeof(req.session.blockDone) === 'undefined'){
        req.session.blockDone = 1;
       }
       console.log("blockCap:",req.session.blockCapcity);
       console.log("stadiumGateNumber:",req.session.stadiumGateNum);
    // render the class form
    res.render('class/add_class_form2',{title : "Block "+(req.session.blockDone),authenticated : true});

  }
};

module.exports.updateClassPhase1= (req,res,next)=>{
  req.session.class_id =  req.params.id;
  if (req.method === 'POST') {
    // req.checkBody('classname','classname field cannot be empty').notEmpty();
    // req.checkBody('classname','classname must be between 4-15 characters long.').len(4,15);
    // req.checkBody('email' , 'the email you entered is invalid, please try again.').isEmail();

    const errs     = req.validationErrors();
    if(errs){
      let classErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'classname': classErrs.classname =errs[i].msg; break;
          case 'password': classErrs.password =errs[i].msg; break;

        }
      }
       res.render('class/update_class_form',{
        title: "Validation Errors",
         errors : errs,
         classnameErr:classErrs.classname,
         passwordErr:classErrs.password,
         authenticated : true

       });
    }
    else{
        req.session.className   = req.body.className;
        req.session.stadiumName = req.body.stadiumName;
        classRef.child(req.session.class_id).update({
          className  :req.body.className,
          stadiumName:req.body.stadiumName });
        res.redirect('/main/class/'+req.session.class_id+'/update/b');
          
   } 
  } else {
    classRef.child(req.session.class_id).once('value').then((dataSnapshot)=>{
      if(dataSnapshot.exists()){
        let classObj  = dataSnapshot.val();
        req.session.blockCount = dataSnapshot.child("blocks").numChildren();
        req.session.blockId    = dataSnapshot.child("blocks");
        res.render('class/update_class_form',{title : classObj.className , classObj : classObj,authenticated : true  });
      } else throw new Error(); 
    }).catch((err)=>{
      console.log("Error Getting info from database " + err);
      res.render('class/update_class_form',{title : "Not Found In Database "});

    });
    
  }

};
module.exports.updateClassPhase2= (req,res,next)=>{
  if(req.method === 'POST'){
        res.redirect('/main/class/'+req.session.class_id+'/update/'+req.body.blockNum);
  }
  else{
  let blockCount = toNumbers(Number(req.session.blockCount));  
  req.session.bNumbers = [];
       
  classRef.child(req.session.class_id).child("blocks").once("value").then((dataSnapshot)=>{
    dataSnapshot.forEach((childSnapshot)=>{
      let childData = childSnapshot.val();
      req.session.bNumbers.push(childData.blockNumber);
    });
      console.log(req.session.bNumbers);

  res.render('class/update_class_form2',{
    title      : "Chose which block to update " ,
    blockCount : req.session.bNumbers,
    classId    : req.session.class_id ,
    authenticated : true

  });
  });

}
};


module.exports.updateClassPhase3 = (req,res,next) => {
  let blockNumber = req.params.blockNum;
  if(req.method === 'POST'){
    //----------Validation Start-------------
    // req.checkBody('classname','classname field cannot be empty').notEmpty();
    // req.checkBody('classname','classname must be between 4-15 characters long.').len(4,15);
    // req.checkBody('email' , 'the email you entered is invalid, please try again.').isEmail();


    const errs     = req.validationErrors();
    if(errs){
      let classErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'classname': classErrs.classname =errs[i].msg; break;
          case 'password': classErrs.password =errs[i].msg; break;

        }
      }
      console.log(errs[0]);
       res.render('class/update_class_form3',{
        title: "Registeration error",
         errors : errs,
         classnameErr:classErrs.classname,
         passwordErr:classErrs.password,

       });
    }
    else{
  
        classRef.child(req.session.class_id ).child("blocks").child(req.session.bKey).update({
          blockNumber : req.body.blockNumber,
          seats       : toNumbers(Number(req.body.seats)),
          gateNumber  : req.body.gateNumber

        });
       
   
        res.redirect('/tables');
       
    }
  }
  else{
    classRef.child(req.session.class_id).child("blocks").once("value").then((dataSnapshot)=>{
      dataSnapshot.forEach((childSnapshot)=>{
        let childData = childSnapshot.val();

          if(childData.blockNumber === blockNumber){
          req.session.bKey = childSnapshot.key;
            let blockObj ={
              blockNumber: childData.blockNumber,
              seats      : Math.max(...childData.seats),
              gateNumber : childData.gateNumber
            }; 
            res.render('class/update_class_form3',{title : "Block "+(blockNumber) ,blockObj:blockObj});
          }
      });
    });
    // render the class form

  }
};


module.exports.deleteClass = (req,res,next)=>{
  let class_id =  req.params.id;
  classRef.child(class_id).remove();
  res.redirect('/tables');
};

function toNumbers(num){
  let numbers = [];
  for (let i = 1; i <= num; i++) {
    numbers.push(i);
  }
  return numbers;
}