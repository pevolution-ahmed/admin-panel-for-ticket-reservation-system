const db = require('../routes/db').db;
const adminRef  = db.ref("Admin");

module.exports.get_log = async(req,res,next) => {
  if(req.method === 'POST'){
    req.checkBody('username','Username field cannot be empty').notEmpty();
    req.checkBody('username','Username must be between 4-15 characters long.').len(4,15);
    req.checkBody('password','Password field cannot be empty').notEmpty();

    const errs     = req.validationErrors();
    if(errs){
      let userErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'username': userErrs.username =errs[i].msg; break;
          case 'password': userErrs.password =errs[i].msg; break;

        }
      }
       res.render('login',{
        title: "Validation Errors",
         errors : errs,
         usernameErr:userErrs.username,
         passwordErr:userErrs.password,

       });
    }
    else{
      let username = req.body.username;
      let password = req.body.password;
      
      let a = await adminRef.once('value',(data)=>{
        data.forEach((childData)=>{
          if(childData.val().username === username && childData.val().password == password ){
            req.session.authenticated = true;
            req.session.username = username;
            res.redirect('/tables');
          }
        });
        if(typeof(req.session.authenticated)==='undefined'){
          console.log("un authenticated!!");
          
          res.render('login',{title: "login",existsErr : "Not Found in Database"});
        }
  
      }).catch((err)=>{
        console.log(err);
      });
   } 
  }
  else{
  res.render('login',{title : "Login",authenticated : false});
}
};
