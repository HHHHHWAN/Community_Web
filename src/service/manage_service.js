const { read_DB , write_DB } = require("../models/mysql_connect");

const read_DB_promise = read_DB.promise();





const manage_service = {
    
    change_posts_category : async ( change_category, content_id , callback ) => {
        const query = `
            UPDATE Content
            SET content_type = ?
            WHERE id = ?
        `;

        try{
            const [ DB_result ] = await read_DB_promise.query(query, [ change_category, content_id ]);

            callback(null ,DB_result.affectedRows > 0);
            
        }catch(err){
            console.log(" 서버에서 요청을 처리하지 못했습니다. " );
            console.error( "(change_posts_category) MySql2 : \n", err.stack);
            callback(500, false);
        }

    },

    block_posts : async ( callback ) => {
        const query = `
            UPDATE Content
            SET visible = 0
            WHERE id = ?
        `;
        try{

            const DB_result = await read_DB_promise.query(query, []);



        }catch(err){

        }
    },

    block_comments : async ( callback ) => {
        const query = `
            UPDATE Comment
            SET visible = 0
            WHERE id = ?
        `;
        try{

            const DB_result = await read_DB_promise.query(query, []);



        }catch(err){

        }
    }
}

module.exports = manage_service;