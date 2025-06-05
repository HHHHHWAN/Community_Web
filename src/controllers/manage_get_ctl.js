const manage_get_service = require('../service/manage_get_service');

exports.getReportList = ( req, res ) => {
    const request_nav = req.query.nav;

    manage_get_service.get_Report_list(request_nav,(status, service_result) => {
        if(status){
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            })
        }

        res.json({
            message : "success",
            result : true,
            data : service_result
        })
    }); 
};

exports.getReportDetails = ( req, res ) => {
    const target_type = req.query.type;
    const target_id = req.query.id;

    manage_get_service.get_Report_list_detail( target_type, target_id, ( status, service_result ) => {
        if(status){
            return res.status(status).json({
                message : "서버에서 요청을 처리하지 못했습니다.",
                result : false,
                data : null
            })
        }

        res.json({
            message : "Success",
            result : true,
            data : service_result
        })
    });
};

// exports.getComplaintReports = ( req, res ) => {
  
// };

exports.getWithdrawsRecord = ( req, res ) => {
  
};