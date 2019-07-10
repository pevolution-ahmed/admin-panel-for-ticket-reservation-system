const express = require('express');
const router  = express.Router();
const loginController = require('../Controllers/loginController');
const db = require('./db').db;
const userRef  = db.ref("User");
const matchRef  = db.ref("Match");
const stadiumRef  = db.ref("Stadium");
const ticketRef  = db.ref("NewTicket");
const classRef  = db.ref("Class");
const teamRef  = db.ref("Team");
	/* GET users listing. */
var passport= require('passport'), LocalStrategy = require('passport-local').Strategy;

  
passport.use(new LocalStrategy(
  function(username, password, done) {
		let authenticated = false;
		
    
  }
));

router.get('/tables', function(req, res, next) {
	if(req.session.authenticated){
	var allData = [];  		
  	userRef.once('value' , (data)=>{
  		allData['userObj'] = data.val();
  		data.forEach((childSnapshot) =>{
             allData.userObj[childSnapshot.key].key = childSnapshot.key;
         });
	});
	matchRef.once('value' , (data)=>{
  		allData['matchObj'] = data.val();
  		data.forEach((childSnapshot) =>{
             allData.matchObj[childSnapshot.key].key = childSnapshot.key;
         });
	});
	stadiumRef.once('value' , (data)=>{
  		allData['stadiumObj'] = data.val();
  		data.forEach((childSnapshot) =>{
             allData.stadiumObj[childSnapshot.key].key = childSnapshot.key;
         });
	});
	teamRef.once('value' , (data)=>{
  		allData['teamObj'] = data.val();
  		data.forEach((childSnapshot) =>{
             allData.teamObj[childSnapshot.key].key = childSnapshot.key;
         });
	});
  classRef.once('value' , (data)=>{
      allData['classObj'] = data.val();
      data.forEach((childSnapshot) =>{
             allData.classObj[childSnapshot.key].key = childSnapshot.key;
         });
  }).then(()=>{
		res.render("tables", {
			title     : "Home" ,
			userObj   : allData.userObj,
			matchObj  : allData.matchObj,
			stadiumObj: allData.stadiumObj,
			teamObj   : allData.teamObj,
			classObj  : allData.classObj,
			authenticated : req.session.authenticated,
			username : req.session.username
	
		}); 
	});
}
else{
	res.render('unauthenicatedUser');
}

 });
router.get('/tables/search',async(req,res ,next)=>{
	let ssn = req.query.ssn.trim();
	if(req.session.authenticated){
		let userTicketsData = [];
		let userData = [];
		let ud =  await userRef.once('value',(dataSnap)=>{
			dataSnap.forEach((childSnapshot)=>{
				userData.push( Object.assign({"key":childSnapshot.key},childSnapshot.val()));
			});
		
		});
		let chosenUser ;
		userData.forEach(element => {
			if(element.nationalId === ssn){
				chosenUser=element;	
			}		
		});	
		if(typeof(chosenUser)=== 'undefined'){
			res.render('searchResult',{title: "User Not Found in Database..",authenticated:req.session.authenticated});
		}
		else{
		let ticketData = [];
		let ticket =  await ticketRef.once('value',(dataSnap)=>{
			dataSnap.forEach((childSnapshot)=>{
				if(childSnapshot.val().userId=== chosenUser.key){
				ticketData.push(childSnapshot.val());
				}
			});
		});
		console.log(ticketData);
		
		if(ticketData.length === 0){

			res.render('searchResult',
			{
			title      : "Search Result",
			userData   : chosenUser ,
			allData : false,
			authenticated : req.session.authenticated

			});		
		}
		else{
			let allData = [] ;
			let finalData = []

			let match = await matchRef.once('value',(snapshot)=>{	
													snapshot.forEach((childSnapshot)=>{
														ticketData.forEach((ticket)=>{
															if(childSnapshot.key === ticket.matchId){
																		allData.push({...ticket,...childSnapshot.val()});											
															}
														});
													});
												
												});
			
			let stadium = await stadiumRef.once('value',(dataSnap)=>{
					dataSnap.forEach((childSnapshot)=>{
						allData.forEach((data)=>{
						if(childSnapshot.val().StadiumName === data.stadiumName){
							finalData.push({...data,...childSnapshot.val()});											

						}
						});
					});
			});
			
			res.render('searchResult',
			{
			title      : "Search Result",
			userData   : chosenUser ,
			allData : finalData,
			authenticated : req.session.authenticated

			});										
		
		}
}
	
	

	
	}
	else{
		res.render('searchResult',
										{
										title      : "Search Result",
										authenticated : req.session.authenticated
										});	
	}
});
router.get('/login',loginController.get_log);
router.post('/login',loginController.get_log);
router.get('/logout',(req,res,next)=>{
	req.session.destroy();
	res.redirect('/login');
});
// router.post('/login',
//   passport.authenticate('local', {
//     successRedirect: '/tables',
// 		failureRedirect: '/login',
// 	failureFlash:true   }),
//   function(req, res) {
//     res.redirect('/');
// 	});

// 	passport.serializeUser(function(user, done) {
// 		done(null, user);
// 	});
	
// 	passport.deserializeUser(function(user, done) {
// 		done(null, user);
// 	});
	async function asyncForEach(array, callback) {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array);
		}
	}

module.exports = router;
