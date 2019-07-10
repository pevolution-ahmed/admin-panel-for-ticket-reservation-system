const express = require('express');
const router  = express.Router();
const userController = require('../Controllers/userController');
const matchController = require('../Controllers/matchController');
const classController = require('../Controllers/classController');
const stadiumController = require('../Controllers/stadiumController');
const multer  = require('multer');
const storage = multer.diskStorage({
	destination : function (req,file,cb) {
		cb(null,'./uploads/');
	},
	filename    : function (req , file , cb){
		cb(null, new Date().toISOString().replace(/:/g, '-') +file.originalname);
	}
});

const upload = multer({storage : storage, limits: {
    fileSize : 1024 * 1024 * 5 
}});
//-------------Checkout Service  underdevelopment ------------------------
var braintree = require('braintree');
var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: 'vqs2dx822jxfbh23',
  publicKey: '5cbq2qc7v7cgdvds',
  privateKey: '22509d7466cf979a76c9f106b184cfc1'
});
const firebase = require('../routes/db').admin;


router.get('/client_token',(req,res,next)=>{


gateway.clientToken.generate({
	
  }, function (err, response) {
	var clientToken = response.clientToken;
	res.send(clientToken);

  });
 
});
router.post("/checkout", function (req, res) {
	var nonceFromTheClient = req.body.payment_method_nonce;
	console.log("from client :",req.body.payment_method_nonce);
	
	// Use payment method nonce here
	gateway.transaction.sale({
		amount: "10.00",
		paymentMethodNonce: nonceFromTheClient,
		options: {
		  submitForSettlement: true
		 }
	  }, function (err, result) {
		  console.log(result);
		  res.send(result);
	  });
	
	});
	//-------------Checkout Service ------------------------

router.route('/user/create')
.get(isAuthenticated,userController.createUser)
.post(isAuthenticated,userController.createUser);
router.route('/user/:id/update')
.get(isAuthenticated,userController.updateUser)
.post(isAuthenticated,userController.updateUser);
router.route('/user/:id/delete').get(userController.deleteUser);

router.post('/match/create',upload.any(),matchController.createMatch);
router.get('/match/create',isAuthenticated,matchController.createMatch);



router.post('/match/:id/update',upload.any(),matchController.updateMatch);
router.get('/match/:id/update',isAuthenticated,matchController.updateMatch);
router.route('/match/:id/delete').get(isAuthenticated,matchController.deleteMatch);

router.route('/class/create/')
.get(isAuthenticated,classController.createClassPhase1)
.post(classController.createClassPhase1);
router.route('/class/create/b')
.get(isAuthenticated,classController.createClassPhase2)
.post(classController.createClassPhase2);


router.route('/class/:id/update')
.get(isAuthenticated,classController.updateClassPhase1)
.post(classController.updateClassPhase1);
router.route('/class/:id/update/b')
.get(isAuthenticated,classController.updateClassPhase2)
.post(classController.updateClassPhase2);
router.route('/class/:id/update/:blockNum')
.get(isAuthenticated,classController.updateClassPhase3)
.post(classController.updateClassPhase3);

router.route('/class/:id/delete').get(classController.deleteClass);

router.route('/stadium/create/')
.get(isAuthenticated,stadiumController.createStadium)
.post(stadiumController.createStadium);

router.route('/stadium/:id/update')
.get(isAuthenticated,stadiumController.updateStadium)
.post(stadiumController.updateStadium);

router.route('/stadium/:id/delete').get(stadiumController.deleteStadium);


function isAuthenticated(req,res,next){
if(req.session.authenticated){
	next();
}
else{
	res.render('unauthenicatedUser');
}
}


module.exports= router;
