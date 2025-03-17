
const user_get_service_object = require("../service/user_get_service");
const user_set_service_object = require("../service/user_set_service");

// env 연동
require('dotenv').config();



// 회원 정보 DOM 데이터 GET
exports.api_getSettinginfo = (req,res) => {

    if(!req.session.user){
        return res.status(401).json({
            message : "세션이 만료되었습니다.",
            result : false,
            data : null
        });
    }

    user_get_service_object.get_Setting_user_info( req.session.user.user_id, (err, service_result) => {
        if(err){
            console.error("( api_getSettinginfo => get_Setting_user_info ) : \n", err.stack);
            return res.status(500).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            });
        }
        if (!service_result.length){
            return res.status(404).json({
                message : "요청한 정보를 찾지 못했습니다.",
                result : false,
                data : null
            });
        }

        res.json({
            message : "처리 성공",
            result : true,
            data : {
                setting_username : service_result[0].username,
                setting_email : service_result[0].email
            }
        });
    });    
};


