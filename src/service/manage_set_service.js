const { read_DB , write_DB } = require("../models/mysql_connect");

const read_DB_promise = read_DB.promise();



/** Manage request list registration. */
function Reportmanage(){
    let targetType = '';
    let targetId = 0;
    let message = '';
    let userId = 0;
    let reportType = '';

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

                await read_DB_promise.query(query,[targetType, targetId, message, userId, reportType]);
            }catch(err){
                console.error(" (add_manage_list) MySql Error : \n", err.stack);
            }
        }
    };
} 


const manage_set_service = {
    
    /** 게시글 카테고리 변경 */
    change_posts_category : async ( change_category, content_id, request_user, callback ) => {
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
                    msg : " 게시글 카테고리 이동 처리 ",
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.log(" 서버에서 요청을 처리하지 못했습니다. " );
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
                    msg : " 게시글 블라인드 처리 ",
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.log(" 서버에서 요청을 처리하지 못했습니다. " );
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
                    msg : " 댓글 블라인드 처리 ",
                    user_id : request_user
                });
                manage_report.reqReport();
            }

            callback(null, isUpdated);
        }catch(err){
            console.log(" 서버에서 요청을 처리하지 못했습니다. " );
            console.error( "(change_posts_category) MySql2 : \n", err.stack);
            callback(500, false);
        }
    }
}

module.exports = manage_set_service;