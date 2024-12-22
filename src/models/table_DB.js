//table_DB defined

const createTable = { 

    Forum_Table : (write_db) => {
        const query = `
        CREATE TABLE IF NOT EXISTS Content (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            text TEXT NOT NULL,
            view_count INT DEFAULT 0,
            content_type ENUM('info','qa','life') NOT NULL,
            user_id INT NOT NULL,
            date_create DATETIME DEFAULT CURRENT_TIMESTAMP,
            visible BIT(1) DEFAULT 1 NOT NULL,
            date_delete DATETIME
        )`;

        write_db.query(query, (err, results) => {
            if(err){
                console.error('create table err :',err);
            } else {
                console.log('create table ok :',results);
            }
        });
    },

    User_Table : (write_db) => {
        const query = `
        CREATE TABLE IF NOT EXISTS User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nickname VARCHAR(15) NOT NULL,
            username VARCHAR(15) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(30) NOT NULL UNIQUE,
            key_github INT UNIQUE,
            key_naver VARCHAR(100) UNIQUE,
            create_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`;
        
        write_db.query(query, (err, results) => {
            if(err){
                console.error('create table err : ' , err);
            } else {
                console.log('create table ok : ' , results);
            }
        });
    },

    Comment_Table : (write_db) => {
        const query = `
        CREATE TABLE IF NOT EXISTS Comment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            comment VARCHAR(255) NOT NULL,
            user_id INT NOT NULL,
            content_id  INT NOT NULL,
            parent_id INT,
            create_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            visible BIT(1) DEFAULT 1,
            delete_at DATETIME
        )`;

        // CREATE CONSTRAINT
        // CONSTRAINT cons_p1 FOREIGN KEY(user_id) REFERENCES User(id) ON DELETE CASCADE,
        // CONSTRAINT cons_p2 FOREIGN KEY(content_id) REFERENCES Content(id) ON DELETE CASCADE
        
        write_db.query(query, (err, results) => {
            if(err){
                console.error('create table err : ' , err);
            } else {
                console.log('create table ok : ' , results);
            }
        });
    }
};

module.exports = createTable;