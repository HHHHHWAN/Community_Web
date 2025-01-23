/// Server start js
const express = require('express');
require('dotenv').config()
// layouts setting
const expressLayouts = require('express-ejs-layouts');
const path = require('path');

// app url 상속
const indexRoutes = require('./src/routes/index'); 

const session_config = require('./src/auth/session_setting');

// session local setting middleware
const local_session = require('./src/middleware/sessions_local');


const app = express();

//session 관련 설정
app.use(session_config());
app.use(local_session);



// 정적 파일 경로 alias 정의 (css , js , img  클라이언트 기준)
// express.static의 용도, 클라이언트에 path 제공 (ex. localhost/public/img/eye-icon.png)
app.use('/public', express.static(path.join(__dirname, '/public')));

///settings...
// 뷰 & 템플릿 엔진, 경로 alias 설정 (컨트롤러 기준)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/public/templates'));

//json 형식 데이터 파서 
app.use(express.json());
//URL-encoded 데이터 수신
app.use(express.urlencoded({ extended : true }));



// 기본 고정 layout 경로 지정 ( 상속용 ) views 경로 기준 

app.use(expressLayouts) // layouts 상속기능 적용 ( SSR 기준 )
app.set('layout','layout/forum') // views 설정 경로 기준  모든 ejs는 forum_main 레이아웃 적용


app.use('/', indexRoutes) 

// undefine endpoint
app.use((req, res) => {
    res.status(404).render('forum_error.ejs',{ returnStatus : 404 , layout : false })
});


async function startserver(){
	const port = process.env.EXPRESS_PORT;

	// 웹 서버 ip port 세팅 
	await app.listen(port, '0.0.0.0',() => {
		console.log('-----------------------------------------------');
		console.log('Server running at http://0.0.0.0:'+ port + '/');
		console.log('-----------------------------------------------');
	});
}


startserver();




