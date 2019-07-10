const db = require('../routes/db').db;
const stadiumRef  = db.ref("Stadium");
const firebase = require('../routes/db').admin;

module.exports.createStadium = (req,res,next) => {
  if(req.method === 'POST'){
          //----------Validation Start-------------
    req.checkBody('stadiumName','Stadium Name field cannot be empty').notEmpty();
    req.checkBody('capacity','Capacity field cannot be empty').notEmpty();
    req.checkBody('address','Address cannot be empty').notEmpty();
    req.checkBody('gatesNumber','Number Of Gates field cannot be empty').notEmpty();
    
    const errs     = req.validationErrors();
    console.log(errs);
    
    if(errs){
      console.log(req.body.stadiumName);
      
     let StadiumErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'stadiumName': StadiumErrs.stadiumName =errs[i].msg; break;
          case 'capacity': StadiumErrs.capacity =errs[i].msg; break;
          case 'address': StadiumErrs.address =errs[i].msg; break;
          case 'gatesNumber': StadiumErrs.gatesNumber =errs[i].msg; break;
        }
      }
       res.render('stadium/addStadium',{
        title: "Registeration error",
         errors : errs,
         stadiumNameErr:StadiumErrs.stadiumName,
         capacityErr:StadiumErrs.capacity,
         addressErr:StadiumErrs.address,
         gatesNumberErr:StadiumErrs.gatesNumber,
         authenticated: req.session.authenticated
       });
    }
    else{
      let stadiumObj = {
        Address : req.body.address,
        Capacity: req.body.capacity,
        NumberOfGates: req.body.gatesNumber,
        StadiumName  : req.body.stadiumName
      };
      console.table(stadiumObj);
      
      stadiumRef.once('value',(dataSnapshot)=>{
        dataSnapshot.forEach((childSnap)=>{
          if(childSnap.key === stadiumObj.StadiumName){
            stadiumObj.existsErr = "stadium Name Already Exisits.. try another one!";
            res.render('stadium/addStadium',{
              title: "Registration Error",
              existsErr : stadiumObj.existsErr,
              authenticated: req.session.authenticated
          });
          }
        });
      
        if(typeof(stadiumObj.existsErr) === 'undefined'){
          stadiumRef.child(stadiumObj.StadiumName).set(stadiumObj).catch((err)=>{
               console.log(err);
          });
       res.redirect('/tables');
       }
       
      });
    
    }
  }
  else {
    // render the Stadium form
    res.render('stadium/addStadium',{title: "Add Stadium",authenticated: true});

  }

};
module.exports.updateStadium = (req,res,next) => {
  let stadium_id = req.params.id;
  if(req.method === 'POST'){
            //----------Validation Start-------------
            req.checkBody('stadiumName','Stadium Name field cannot be empty').notEmpty();
            req.checkBody('capacity','Capacity field cannot be empty').notEmpty();
            req.checkBody('address','Address cannot be empty').notEmpty();
            req.checkBody('gatesNumber','Number Of Gates field cannot be empty').notEmpty();
            
            const errs     = req.validationErrors();
            console.log(errs);
            
            if(errs){
              console.log(req.body.stadiumName);
              
             let StadiumErrs ={};
              for (let i = 0; i <errs.length; i++) {
                switch(errs[i].param){
                  case 'stadiumName': StadiumErrs.stadiumName =errs[i].msg; break;
                  case 'capacity': StadiumErrs.capacity =errs[i].msg; break;
                  case 'address': StadiumErrs.address =errs[i].msg; break;
                  case 'gatesNumber': StadiumErrs.gatesNumber =errs[i].msg; break;
                }
              }
               res.render('stadium/addStadium',{
                title: "Registeration error",
                 errors : errs,
                 stadiumNameErr:StadiumErrs.stadiumName,
                 capacityErr:StadiumErrs.capacity,
                 addressErr:StadiumErrs.address,
                 gatesNumberErr:StadiumErrs.gatesNumber,
                 authenticated: req.session.authenticated
               });
        }
    else{
        let stadiumObj = {
            Address : req.body.address,
            Capacity: req.body.capacity,
            NumberOfGates: req.body.gatesNumber,
            StadiumName  : req.body.stadiumName
          };
          stadiumRef.child(stadium_id).update(stadiumObj);
  }
}
else {
  stadiumRef.child(stadium_id).once("value").then((dataSnapshot)=>{
    if(dataSnapshot.exists()){
      let stadiumObj = dataSnapshot.val();

      res.render('Stadium/updateStadium',{title : "Stadium Update" , stadiumObj : stadiumObj,authenticated: req.session.authenticated});
    }
    else throw new Error();

  }).catch((err)=>{
    console.log(err);
    
  });

}

};
module.exports.deleteStadium = (req,res,next) => {
 let stadium_id =  req.params.id;
  stadiumRef.child(stadium_id).remove();
  res.redirect('/tables');

};