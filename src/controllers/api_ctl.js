const user_DB = require("../service/User_Service");

// env 연동
require('dotenv').config();

// 회원 정보 DOM 데이터 GET
exports.api_getSettinginfo = (req,res) => {

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    user_DB.get_Setting_user_info( req.session.user.user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettinginfo => get_Setting_user_info ) : \n", err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }
        if (!service_result.length){
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false
            });
        }

        res.json({
            setting_username : service_result[0].username,
            setting_email : service_result[0].email,
            result : true
        });
    });    
};





// 계정 관리 DOM 데이터 GET
exports.api_getSettingConfig = (req,res) => {

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    user_DB.get_Setting_Social( req.session.user.user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettingConfig => get_Setting_Social ) : \n",err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false
            });
        }
        if (!service_result.length){
            console.error(err);
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false
            });
        }

        res.json({
            social_info : service_result[0],
            result : true
        });
    });    
};



// 닉네임 변경 컨트롤
exports.api_putSettingNickname = (req, res) => {
    const input_nickname = req.body.nickname_input || undefined;

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

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

    user_DB.get_Nickname( input_nickname, (err, check) => {
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

        user_DB.put_Setting_Nickname(req.session.user.user_id, input_nickname , (err) => {
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
    let request_social_name = req.body.social_name;


    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    if(social_list.some(row => row === request_social_name)){
        request_social_name = "key_" + request_social_name;
        user_DB.put_Social_Unconnect(req.session.user.user_id, request_social_name, ( err )=> {
            if(err){
                return res.status(500).json({
                    message : "요청을 처리하는 도중, 문제가 발생했습니다.",
                    result : false
                });
            }

            res.json({
                message : "성공적으로 소셜 연동을 해제하였습니다.",
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
    

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false
        });
    }

    if(JSON.parse(process.env.HTTPS)){
        return res.json({
            message : "( 테스트 ) 비밀번호 변경이 완료되었습니다.",
            result : false
        });
    }
    
    user_DB.put_Password_change(req.session.user.user_id, current_password, new_password, (status,service_message) => {

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