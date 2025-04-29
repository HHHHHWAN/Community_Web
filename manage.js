const express = require('express');
require('dotenv').config()
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const csrf_token = require('csurf');
///--------------------------------------------------

/// Session setting
const session_middle = require('./src/config/session_setting');
const local_session = require('./src/middleware/sessions_local');

// route
const api_Routes = require('./src/routes/api'); 
const user_Routes = require('./src/routes/user'); 
const auth_Routes = require('./src/routes/auth'); 
const post_Routes = require('./src/routes/post'); 

/// Express
const app = express();

/// 공통 미들웨어 관련 설정
app.use(session_middle());
app.use(csrf_token());
app.use(local_session);
app.use((err, req, res, next) => {
	if (err.code === 'EBADCSRFTOKEN') {
	  return res.status(403).json({
		message : '권한이 없습니다.',
		result : false
	  });      
	}
	next(err);
  });

/// root path
app.use('/public', express.static(path.join(__dirname, '/public')));

///static data 경로 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/templates'));


/// result DATA
app.use(express.json());
app.use(express.urlencoded({ extended : true }));

/// PROD/DEV CHECK
if(JSON.parse(process.env.HTTPS)){
	app.set('trust proxy',1);
}

/// default layout define
app.use(expressLayouts);
app.set('layout','layout/forum');


/// routes
app.use('/api', api_Routes);
app.use('/', auth_Routes);
app.use('/', user_Routes);
app.use('/', post_Routes);
// undefine endpoint
app.use((req, res) => {
    res.status(404).render('forum_error.ejs',{ returnStatus : 404 , layout : false })
});


function startserver(){
	const port = process.env.EXPRESS_PORT;
	const date = new Date();

	app.listen(port, '0.0.0.0',() => {
		console.log('-----------------------------------------------');
		console.log(date.toLocaleString());
		console.log('Server running at http://0.0.0.0:'+ port + '/');
		console.log('-----------------------------------------------');
	});
}


startserver();




