const { read_DB , write_DB } = require("../models/mysql_connect");

const read_DB_promise = read_DB.promise();

const data_utils = require('../utils/dataUtils')

const manage_get_service = {

    /** 관리 내역 출력 */
    get_Report_list : async ( request_nav, request_page, callback ) => {
        const query = `
        SELECT 
            R.*,
            U.nickname AS manage_nickname
        FROM (
            SELECT *
            FROM Report
            WHERE report_type = ? ) R
        JOIN User U ON U.id = R.user_id
        ORDER BY R.reported_at DESC
        LIMIT 10 OFFSET ?`;

        const offset = ( request_page - 1 ) * 10;

        const totalQuery = `SELECT count(*) AS totalCount FROM Report WHERE report_type = ?`;

        try{
            const [ DB_result ] = await read_DB_promise.query(query, [request_nav, offset]);
            const [ DB_result_2 ] = await read_DB_promise.query(totalQuery, [request_nav]);

            DB_result.forEach( row => {
                row.reported_at = data_utils.date_before(row.reported_at);
            });

            const listCount = Math.ceil(DB_result_2[0].totalCount / 10 );

            callback(
                null, 
                { issueList : DB_result, listCount}
            );
        }catch(err){
            console.error( "(get_manage_list) MySql2 : \n", err.stack);
            callback(500, null);
        }
    },

    /** 관리 대상 세부 내용 출력 */
    get_Report_list_detail : async (requestNav, target_type, target_id, callback ) => {

        // detail query
        const query = target_type === 'content' ? `
            SELECT 
                C.id,
                C.title,
                C.text,
                C.visible,
                U.nickname 
            FROM (
                SELECT * 
                FROM Content 
                WHERE id = ?
                ) C
            JOIN User U ON U.id = C.user_id` : `
            SELECT 
                C.comment,
                C.visible AS comment_visible,
                U.nickname,
                P.content_type,
                P.id,
                P.visible
            FROM 
                (
                    SELECT *
                    FROM Comment
                    WHERE id = ? 
                ) C
            JOIN User U ON C.user_id = U.id
            JOIN Content P ON P.id = C.content_id`;

        // 관련 항목 리스트 업
        const query_2 = `
            SELECT 
                id,
                message,
                DATE_FORMAT(reported_at, '%Y-%m-%d') AS reported_at
            FROM Report 
            WHERE target_type = ? AND target_id = ? AND report_type = 'manage'
        ` 
        
        try{
            const [ DB_result ] = await read_DB_promise.query(query,[target_id]);

            if ( requestNav === 'manage'){
                const [ DB_result_2 ] = await read_DB_promise.query(query_2,[target_type, target_id]);
                DB_result[0].relatedReport = DB_result_2;
            }

            callback(null, DB_result[0]);
        }catch(err){
            console.error( "(get_manage_list) MySql2 : \n", err.stack);
            callback(500, false);
        }
    },

};


module.exports = manage_get_service;