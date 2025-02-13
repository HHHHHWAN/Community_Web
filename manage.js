/// Server start js
const express = require('express');
require('dotenv').config()

const expressLayouts = require('express-ejs-layouts');
const path = require('path');


const indexRoutes = require('./src/routes/index'); 

const session_config = require('./src/auth/session_setting');


const local_session = require('./src/middleware/sessions_local');


const app = express();

//session 관련 설정
app.use(session_config());
app.use(local_session);




app.use('/public', express.static(path.join(__dirname, '/public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/templates'));


app.use(express.json());
app.use(express.urlencoded({ extended : true }));

if(JSON.parse(process.env.HTTPS)){
	app.set('trust proxy',1);
}


app.use(expressLayouts) 
app.set('layout','layout/forum') 


app.use('/', indexRoutes) 

// undefine endpoint
app.use((req, res) => {
    res.status(404).render('forum_error.ejs',{ returnStatus : 404 , layout : false })
});


async function startserver(){
	const port = process.env.EXPRESS_PORT;

	await app.listen(port, '0.0.0.0',() => {
		console.log('-----------------------------------------------');
		console.log('Server running at http://0.0.0.0:'+ port + '/');
		console.log('-----------------------------------------------');
	});
}


startserver();




