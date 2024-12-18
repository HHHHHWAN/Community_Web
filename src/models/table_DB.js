//table_DB defined

const DB_connect = require('../utils/mysql_connect'); //Mysql 연결 파일 

const createTable = { 

    Forum_Table : () => {
        const query = `
        CREATE TABLE IF NOT EXISTS Content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            date_create DATETIME DEFAULT CURRENT_TIMESTAMP,
            view_count INT DEFAULT 0,
            content_type ENUM('info','qa','life') NOT NULL
        )`;

        DB_connect.query(query, (err, results) => {
            if(err){
                console.error('create table err :',err);
            } else {
                console.log('create table ok :',results);
            }
        });
    },

    User_Table : () => {
        const query = `
        CREATE table if not exists User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(15) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(30) NOT NULL UNIQUE,
            create_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;
        
        DB_connect.query(query, (err, results) => {
            if(err){
                console.error('create table err : ' , err);
            } else {
                console.log('create table ok : ' , results);
            }
        });
    },

    Comment_Table : () => {
        const query = `
        CREATE table if not exists Comment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            comment VARCHAR(255) NOT NULL,
            create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            user_id INT NOT NULL,
            content_id  INT NOT NULL,
            CONSTRAINT cons_p1 FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE,
            CONSTRAINT cons_p2 FOREIGN KEY(content_id) REFERENCES Content(id) ON DELETE CASCADE
        )`;
        
        DB_connect.query(query, (err, results) => {
            if(err){
                console.error('create table err : ' , err);
            } else {
                console.log('create table ok : ' , results);
            }
        });
    }
};

module.exports = createForumTable;