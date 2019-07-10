const db = require('../routes/db').db;
const matchRef  = db.ref("Match");
const firebase = require('../routes/db').admin;
const schedule = require('node-schedule');

module.exports.createMatch = (req,res,next) => {
  if(req.method === 'POST'){
          //----------Validation Start-------------
    req.checkBody('homeTeamName','Home Team field cannot be empty').notEmpty();
    req.checkBody('homeTeamName','Home Team  must be between 4-30 characters long').len(4,30);
    req.checkBody('awayTeamName','away Team field cannot be empty').notEmpty();
    req.checkBody('awayTeamName','away Team  must be between 4-30 characters long').len(4,30);
    
    const errs     = req.validationErrors();
    if(errs){
     let matchErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'matchname': matchErrs.matchname =errs[i].msg; break;
          case 'password': matchErrs.password =errs[i].msg; break;
          case 'passwordMatch': matchErrs.passwordMatch =errs[i].msg; break;
          case 'email': matchErrs.email = errs[i].msg; break;
          case 'nationalId': matchErrs.nationalId =errs[i].msg; break;
        }
      }
       res.render('match/addMatch',{
        title: "Registeration error",
         errors : errs,
         matchnameErr:matchErrs.matchname,
         passwordErr:matchErrs.password,
         passwordMatchErr:matchErrs.matchname,
         emailErr:matchErrs.matchname,
         nationalIdErr:matchErrs.matchname,
         authenticated: true
       });
    }
    else{
      
      let bucket = firebase.storage().bucket();
      bucket.upload(req.files[0].path,{predefinedAcl: 'publicRead'},(err,remoteFile)=>{
      let homeTeamLink = remoteFile.metadata.mediaLink;
      console.log(homeTeamLink);
      
      if(!err){

        bucket.upload(req.files[1].path,{predefinedAcl: 'publicRead'},(err, remoteFile2)=> {
          if(!err){
            let awayTeamLink = remoteFile2.metadata.mediaLink;
            console.log(awayTeamLink);

            let matchObj = {
            HomeTeamName    : req.body.homeTeamName,
            AwayTeamName    : req.body.awayTeamName,
            HomeTeamImage     : homeTeamLink,
            AwayTeamImage     : awayTeamLink,
            StadiumName     : req.body.stadiumName,
            classTicketPrice: { 
              "A":req.body.classTicketPrice[0],
              "B":req.body.classTicketPrice[1],
              "C":req.body.classTicketPrice[2]
            },
            Stage           : req.body.stage,
            Date            : req.body.matchDate,
            StartTime       : req.body.startTime  
            };
           let match_id = matchRef.push(matchObj).key;
            // let date = new Date(req.body.matchDate);
            // let st = req.body.startTime ;
            // let h = Number(st.slice(0,2));
            // let m = Number(st.slice(3,st.length));
            // let month = date.getUTCMonth() ;
            // let day = date.getUTCDate();
            // let year = date.getUTCFullYear(); 
            // let matchDate = new Date(year,month,day,h,m,0);
            // let j = schedule.scheduleJob(matchDate, function(){
            //   matchRef.child(match_id).remove();
                
            // });  
            matchRef.child(match_id).update({MatchId : match_id});
            res.redirect('/tables');

            }
            else console.log(err);
      });

      }
      else console.log(err);

      });
    }
  }
  else {
    // render the match form
    res.render('match/addMatch',{title: "Add Match",authenticated: true});

  }

};
module.exports.updateMatch = (req,res,next) => {
  let match_id = req.params.id;
  if(req.method === 'POST'){
            //----------Validation Start-------------
    req.checkBody('homeTeamName','Home Team field cannot be empty').notEmpty();
    req.checkBody('homeTeamName','Home Team  must be between 4-30 characters long').len(4,30);
    req.checkBody('awayTeamName','away Team field cannot be empty').notEmpty();
    req.checkBody('awayTeamName','away Team  must be between 4-30 characters long').len(4,30);
    req.checkBody('stadiumName','stadium Name field cannot be empty').notEmpty();
    const errs     = req.validationErrors();
    if(errs){
     let matchErrs ={};
      for (let i = 0; i <errs.length; i++) {
        switch(errs[i].param){
          case 'matchname': matchErrs.matchname =errs[i].msg; break;
          case 'password': matchErrs.password =errs[i].msg; break;
          case 'passwordMatch': matchErrs.passwordMatch =errs[i].msg; break;
          case 'email': matchErrs.email = errs[i].msg; break;
          case 'nationalId': matchErrs.nationalId =errs[i].msg; break;
        }
      }
       res.render('match/updateMatch',{
        title: "Registeration error",
         errors : errs,
         matchnameErr:matchErrs.matchname,
         passwordErr:matchErrs.password,
         passwordMatchErr:matchErrs.matchname,
         emailErr:matchErrs.matchname,
         nationalIdErr:matchErrs.matchname,
         authenticated: true
       });
    }
    else{
      let bucket = firebase.storage().bucket();
      
      bucket.upload(req.files[0].path,{predefinedAcl: 'publicRead'},(err,remoteFile)=>{
        let homeTeamLink = remoteFile.metadata.mediaLink;
        
        if(!err){
          bucket.upload(req.files[1].path,{predefinedAcl: 'publicRead'},(err, remoteFile2)=> {
            if(!err){
             let awayTeamLink = remoteFile2.metadata.mediaLink;
    
             console.log("home : ");
             console.log(homeTeamLink);
             console.log("away : ");
             console.log(awayTeamLink);
             let matchObj = {
              HomeTeamName    : req.body.homeTeamName,
              AwayTeamName    : req.body.awayTeamName,
              HomeTeamImage     : homeTeamLink,
              AwayTeamImage     : awayTeamLink,
              StadiumName     : req.body.stadiumName,
              classTicketPrice: { 
                "A":req.body.classTicketPrice[0],
                "B":req.body.classTicketPrice[1],
                "C":req.body.classTicketPrice[2]
              },
              MatchId         : match_id,
              Stage           : req.body.stage,
              Date            : req.body.matchDate,
              StartTime       : req.body.startTime  
             };
             let date = new Date(req.body.matchDate);
             let st = req.body.startTime ;
             let h = Number(st.slice(0,2));
             let m = Number(st.slice(3,st.length));
             let month = date.getUTCMonth() ;
             let day = date.getUTCDate();
             let year = date.getUTCFullYear(); 
             let matchDate = new Date(year,month,day,h,m,0);
             let j = schedule.scheduleJob(matchDate, function(){
               matchRef.child(match_id).remove();
                 
             });  
             
             matchRef.child(match_id).update(matchObj);
             res.redirect('/tables');

             }
             else console.log(err);
        });

        }
        else console.log(err);


      });
  }
}
else {
  matchRef.child(match_id).once("value").then((dataSnapshot)=>{
    if(dataSnapshot.exists()){
      let matchObj = dataSnapshot.val();

      res.render('match/updateMatch',{title : "Match Update" , matchObj : matchObj,authenticated: true});
    }
    else throw new Error();

  }).catch((err)=>{
    console.log(err);
    
  });

}

};
module.exports.deleteMatch = (req,res,next) => {
 let match_id =  req.params.id;
  matchRef.child(match_id).remove();
  res.redirect('/tables');

};