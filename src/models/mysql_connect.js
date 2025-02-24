const DB = require('mysql2');
require('dotenv').config();

// NO Docker setting
// const read_DB = DB.createConnection({
//     host : '',
//     port : ,
//     user : '',
//     password : '',
//     database : ''
// });
// 컨테이너 외부 ( MySQL이 외부에 있을 경우, 허용된 아이피로 접근되는 유저를 생성해야함 )

const read_DB = DB.createConnection({
    host : 'DB',
    user : process.env.DB_USER_NAME,
    password : process.env.DB_USER_PASS,
    database : process.env.DB_DATA_NAME
});

const write_DB = DB.createConnection({
    host : 'DB',
    user : process.env.DB_USER_NAME,
    password : process.env.DB_USER_PASS,
    database : process.env.DB_DATA_NAME
});


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


//  Initialize Table
read_DB.query(`SHOW TABLES`, (err, query_results) => {
    if(err){
        console.error(" ( Initialize Table ) 초기화 체크 실패 : \n", err);
        return
    }

    if(!query_results.length){
        const TableObject = require('./mysql_init');
        TableObject.Comment_Table(write_DB);
        TableObject.Forum_Table(write_DB);
        TableObject.User_Table(write_DB);

        console.log("-- 테이블 초기화 진행 완료 --");
    }
});

module.exports = { read_DB, write_DB };
