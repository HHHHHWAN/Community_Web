// sql 모듈 가져오기
const DB = require('mysql2');
require('dotenv').config();

//sql 연결 설정
// const read_DB = DB.createConnection({

//     host : '127.0.0.1',
//     port : 2201,
//     user : 'mypageread',
//     password : 'Sqltest1!',
//     database : 'node_js_CRUD_main'
// });

const read_DB = DB.createConnection({
    host : 'DB',
    user : process.env.DB_USER_NAME,
    password : process.env.DB_USER_PASS,
    database : process.env.DB_DATA_NAME
});


// 읽기, 쓰기 전용

// 같은 로컬
// const write_DB = DB.createConnection({
//     host : '10.0.2.15',
//     port : 2201,
//     user : 'sqlmain1',
//     password : 'ghkstest1',
//     database : 'node_js_CRUD_main'
// });

// 컨테이너 ( MySQL이 외부에 있을 경우, 허용된 아이피로 접근되는 유저를 생성해야함 )
const write_DB = DB.createConnection({
    host : 'DB',
    user : process.env.DB_USER_NAME,
    password : process.env.DB_USER_PASS,
    database : process.env.DB_DATA_NAME
});


// DB 연결 시도  status  출력
read_DB.connect((err) => {
if (err) { // promise 값 check 
    console.error('MySQL 연결 실패 : ', err);
    return;
    }
    console.log('MySql ( read_DB ) Connect Success');   
});

write_DB.connect((err) => {
    if (err) { // promise 값 check 
        console.error('MySQL 연결 실패 : ', err);
        return;
        }
        console.log('MySql ( write_DB ) Connect Success');   
    });


// 현 프로젝트 모듈화 
module.exports = { read_DB, write_DB };
