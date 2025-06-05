const { read_DB , write_DB } = require("../models/mysql_connect");

const read_DB_promise = read_DB.promise();

const data_utils = require('../utils/dataUtils')

const manage_get_service = {

    /** 관리 내역 출력 */
    get_Report_list : async ( request_nav, callback ) => {
        const query = `
        SELECT 
            R.*,
            U.nickname AS manage_nickname
        FROM (
            SELECT *
            FROM Report
            WHERE report_type = ? ) R
        JOIN User U ON U.id = R.user_id
        ORDER BY R.reported_at DESC`;
        try{
            const [ DB_result ] = await read_DB_promise.query(query, [request_nav]);

            DB_result.forEach( row => {
                row.reported_at = data_utils.date_before(row.reported_at);
            });

            callback(null, DB_result);
        }catch(err){
            console.error( "(get_manage_list) MySql2 : \n", err.stack);
            callback(500, false);
        }
    },

    /** 관리 대상 세부 내용 출력 */
    get_Report_list_detail : async ( target_type, target_id, callback ) => {
        const query = target_type === 'content' ? `
            SELECT 
                C.*, 
                U.nickname
            FROM (
                SELECT * 
                FROM Content 
                WHERE id = ?
                ) C
            LEFT JOIN User U ON U.id = C.user_id` : `
            SELECT 
                C.*,
                U.nickname
            FROM 
                (
                    SELECT *
                    FROM Comment
                    WHERE id = ? 
                ) C
            LEFT JOIN User U ON C.user_id = U.id`;
        
        try{
            const [ DB_result ] = await read_DB_promise.query(query,[target_id]);

            // DB_result.forEach( row => {
            //     row.reported_at = data_utils.date_before(row.reported_at);
            // });

            callback(null, DB_result[0]);
        }catch(err){
            console.error( "(get_manage_list) MySql2 : \n", err.stack);
            callback(500, false);
        }
    },

    get_complaint_list: () => {

    },

    get_withdraws_list : () => {
        // 보류 
    }


};


module.exports = manage_get_service;