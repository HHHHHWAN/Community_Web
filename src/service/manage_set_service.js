const { read_DB , write_DB } = require("../models/mysql_connect");

const read_DB_promise = read_DB.promise();
const data_utils = require('../utils/dataUtils');


/** Manage request list registration. */
function Reportmanage(){
    let targetType = '';
    let targetId = 0;
    let message = '';
    let userId = 0;
    let reportType = '';

    async function duplication_Report_Check(){
        const query = `
            SELECT * 
            FROM Report 
            WHERE 
                target_type = ? AND
                target_id = ? AND
                user_id = ?
        `

        const value_list = [targetType, targetId, userId ]
        try{
            const [DB_result] = await read_DB_promise.query(query, value_list);

            if (DB_result.length){
                return false;
            }

            return true;
        }catch{
            throw "MySQL 요청 에러";
        }
    }

    return {
        setReport : ( { 
            report_type = 'complaint', 
            target_type = '', 
            target_id = 0, 
            msg = '이슈내용 생략', 
            user_id = 0 
        } = {}) => {
            targetType = target_type;
            targetId = target_id;
            message = msg;
            userId = user_id;
            reportType = report_type;
        },
        
        reqReport : async () => {            
            const query = `
                INSERT INTO Report ( target_type, target_id, message, user_id, report_type )
                VALUES ( ?, ?, ?, ?, ?)
            `
            try{
                if(!userId){
                    throw new Error("필수 값이 누락되었습니다. (요청 유저 미식별)");
                }

                if(reportType === 'complaint'){
                    const dup_check_Result = await duplication_Report_Check();

                    if(!dup_check_Result){
                        return {
                            message : "이미 처리된 요청입니다.",
                            result : false
                        }
                    }
                }

                const value_list = [targetType, targetId, message, userId, reportType];
                await read_DB_promise.query(query,value_list);

                return {
                    message : 'success',
                    result : true
                }

            }catch(err){
                console.error(" (add_manage_list) MySql Error : \n", err.stack);
                throw {
                    message : 'fail',
                    result : false
                }
            }
        }
    };
} 


const manage_set_service = {
    
    /** 게시글 카테고리 변경 */
    change_posts_category : async ( category, content_id, request_user, callback ) => {
        
        const change_category = category.change;
        const current_category = category.current;

        const query = `
            UPDATE Content
            SET content_type = ?
            WHERE id = ?
        `;

        try{
            const [ DB_result ] = await read_DB_promise.query(query, [ change_category, content_id ]);


            const isUpdated = DB_result.affectedRows > 0;

            if(isUpdated){
                const manage_report = Reportmanage();
                manage_report.setReport({
                    report_type: 'manage',
                    target_id : content_id,
                    target_type : 'content',
                    msg : `카테고리 이동 처리 (${current_category} -> ${change_category})`,
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.error( "(change_posts_category) MySql2 : \n", err.stack);
            callback(500, false);
        }

    },

    /** 게시글 블라인드 */
    block_posts : async ( content_id, request_user, callback ) => {
        const query = `
            UPDATE Content
            SET visible = 0
            WHERE id = ?
        `;
        try{
            const [ DB_result ] = await read_DB_promise.query(query, [ content_id ]);

            const isUpdated = DB_result.affectedRows > 0;

            if(isUpdated){
                const manage_report = Reportmanage();
                manage_report.setReport({
                    report_type: 'manage',
                    target_id : content_id,
                    target_type : 'content',
                    msg : " 블라인드 처리 ",
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.error( "(change_posts_category) MySql2 : \n", err.stack);
            callback(500, false);
        }
    },

    /** 댓글 블라인드 */
    block_comments : async ( comment_id, request_user, callback ) => {
        const query = `
            UPDATE Comment
            SET visible = 0
            WHERE id = ?
        `;
        try{
            const [ DB_result ] = await read_DB_promise.query(query, [ comment_id ]);

            const isUpdated = DB_result.affectedRows > 0;

            if(isUpdated){
                const manage_report = Reportmanage();
                manage_report.setReport({
                    report_type: 'manage',
                    target_id : comment_id,
                    target_type : 'comment',
                    msg : " 블라인드 처리 ",
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.error( "(change_posts_category) MySql2 : \n", err.stack);
            callback(500, false);
        }
    },

    /** 유저 신고 기록 */
    user_Report : async ( target_type, target_id, request_user, reason, detail, callback ) => {

        const comment = `${reason} <br> ${detail ? data_utils.XSS_check_string(detail) : '' }`;

        const manage_report = Reportmanage();
        manage_report.setReport({
            target_id,
            target_type,
            msg : comment,
            user_id : request_user
        });

        try{
            const reqReport_result = await manage_report.reqReport();

            if(!reqReport_result.result){
                return callback(409, reqReport_result.message);
            }

            callback(null, reqReport_result.message);
        }catch(err){
            callback(500, "서버에서 요청을 처리하지 못했습니다.")
        }
    }
}

module.exports = manage_set_service;