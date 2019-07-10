const admin = require('firebase-admin');
const serviceAccount = require('../caf-2019-firebase-adminsdk.json');
 admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://caf-2019.firebaseio.com/',
  storageBucket: "caf-2019.appspot.com"

});
const db   = admin.database();

module.exports = {
	db:db,
	admin:admin
};