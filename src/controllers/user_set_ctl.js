const user_get_service_object = require("../service/user_get_service");
const user_set_service_object = require("../service/user_set_service");

// env 연동
require('dotenv').config();


// 닉네임 변경 컨트롤
exports.api_putSettingNickname = (req, res) => {

    const input_nickname = req.body.nickname_input;
    const request_user_id = req.session.user.user_id;

    if(input_nickname === req.session.user.nickname){
        return res.status(400).json({
            message : "현재와 동일한 닉네임",
            result : false
        });
    }

    if(!input_nickname){
        return res.status(400).json({
            message : "요청한 값이 존재하지 않음",
            result : false
        });
    }

    // 중복 확인 
    user_get_service_object.get_Nickname( input_nickname, (err, check) => {
        if(err){
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }

        if(check.length){
            return res.status(409).json({
                message : "이미 사용중인 닉네임입니다.",
                result : false
            });
        }
        user_set_service_object.put_Setting_Nickname(request_user_id, input_nickname , (err) => {
            if(err){
                return res.status(500).json({
                    message : "서버에서 요청을 처리하지 못했습니다.",
                    result : false
                });
            }
            
            req.session.user.nickname = input_nickname;
    
            res.json({
                message : '닉네임이 변경되었습니다.',
                result : true
            });
        });
    });
};

// 소셜 해제 컨트롤
exports.api_putSettingSocial = (req, res ) => {
    const social_list = ['github', 'naver'];
    const request_user_id = req.session.user.user_id;
    let request_social_name = req.body.social_name;

    if(social_list.some(row => row === request_social_name)){
        request_social_name = "key_" + request_social_name;
        user_set_service_object.put_Social_Unconnect(request_user_id, request_social_name, ( err )=> {
            if(err){
                return res.status(500).json({
                    message : "요청을 처리하는 도중, 문제가 발생했습니다.",
                    result : false
                });
            }

            res.json({
                message : "성공적으로 소셜 연동을 설정하였습니다.",
                result : true
            });
        });
    }else{
        res.status(400).json({
            message : "잘못된 접근으로, 문제가 발생했습니다.",
            result : false
        });
    }
};

// 비밀번호 변경 컨트롤
exports.api_putSettingPassword = ( req, res ) => {
    const current_password = req.body.Current_Password;
    const new_password = req.body.New_Password;
    const request_user_id = req.session.user.user_id;

    // PROD 비밀번호 변경 방지 ( 임시 ) 
    if(JSON.parse(process.env.HTTPS)){
        return res.json({
            message : "( 테스트 ) 비밀번호 변경이 완료되었습니다.",
            result : false
        });
    }
    
    user_set_service_object.put_Password_change( request_user_id, current_password, new_password, (status,service_message) => {

        if(status){
            return res.status(status).json({
                message : service_message,
                result : false
            });
        }

        res.json({
            message : service_message,
            result : true
        });
    });
};

// 회원 비활성화 
exports.api_WithdrawAccount = (req, res) => {
    const request_user_id = req.session.user.user_id;

    user_set_service_object.set_invisibly_user( request_user_id, (status, service_message) => {
        if(status){
            res.status(status).json({
                message : service_message,
                result : false
            });
        }

        res.json({
            message : "회원탈퇴 처리되었습니다.",
            result : true
        });
    });
};



// 북마크 설정
exports.setBookmark = (req, res) => {
    const content_id = parseInt(req.params.content_id);
    const request_user_id = req.session.user.user_id;

    user_set_service_object.set_Bookmark_info( content_id, request_user_id, (status, service_result) => {
        if(status){
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "등록 완료",
            result : true,
            data : {
                check : service_result
            }
        });
    });
};

// 북마크 해제
exports.delBookmark = (req, res) => {
    const content_id = parseInt(req.params.content_id);
    const request_user_id = req.session.user.user_id;

    user_set_service_object.del_Bookmark_info( content_id, request_user_id, (status, service_result) => {
        if(status){
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "삭제 완료",
            result : true,
            data : {
                check : service_result
            }
        });
    });
};


// 좋아요 설정
exports.setLike = (req, res) => {
    const target_type = req.params.target_type;
    const target_id = parseInt(req.params.target_id);
    
    const request_user_id = req.session.user.user_id;

    user_set_service_object.set_Like_info( target_type, target_id, request_user_id, 
        ( status, service_result ) => {
        if(status){ // 500
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "등록 완료",
            result : true,
            data : {
                check : service_result
            }
        });
    });

};

// 좋아요 해제
exports.delLike = (req, res) => {
    const target_type = req.params.target_type;
    const target_id = parseInt(req.params.target_id);
    

    const request_user_id = req.session.user.user_id;

    user_set_service_object.del_Like_info( target_type, target_id, request_user_id, 
        ( status, service_result ) => {
        if(status){ // 500
            return res.status(status).json({
                message : service_result,
                result : false
            });
        }

        res.json({
            message : "삭제 완료",
            result : true,
            data : {
                check : service_result
            }
        });
    });

};