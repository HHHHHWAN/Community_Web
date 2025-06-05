
const user_check = {

    // 로그인 여부 체크 일반 미들웨어

    check_login : (req, res, next) => {
        const accept = req.headers['accept'].split(',');
        if(!req.session.user){

            // JSON REQUEST 
            if(accept[0] === 'application/json'){
                return res.status(401).json({
                    message: "세션 인증 실패, 세션이 유효하지 않음",
                    returnStatus : 401 });
            }

            // EJS REQUEST ( JSON 처리 )
            if(accept){
                return res.redirect('/login');
            }

            // 그 외
            return res.status(401).render('forum_error.ejs', { layout: false, returnStatus : 401 });        
        }

        next();
    },

    check_logout : (req, res, next) => {

        const accept = req.headers['accept'].split(',');
        // 로그인이 되어있는 경우
        if(req.session.user){

            // JSON REQUEST
            if(accept[0] === 'application/json'){
                return res.status(409).json({
                    message: "이미 로그인 중",
                    returnStatus : 409 });
            }

            // EJS REQUEST
            if(accept[0] === 'text/html'){
                return res.redirect('/');
            }

            // 그 외
            return res.status(401).render('forum_error.ejs', { layout: false, returnStatus : 401 });        
        }

        next();
    },

    check_authority : (req, res, next) => {
        const request_user = req.session.user;
        const accept = req.headers['accept'].split(',');

        // check session
        if(!request_user){
            if(accept[0] === 'application/json'){
                return res.status(401).json({
                    message: "세션 인증 실패, 세션이 유효하지 않음",
                    returnStatus : 401 });
            }

            return res.status(401).render('forum_error.ejs', { layout: false, returnStatus : 401 });        
        }

        // check role
        if(!request_user.role_id === 1){
            if(accept[0] === 'application/json'){
                return res.status(403).json({
                    message: "인증 실패, 허가되지 않은 접근",
                    returnStatus : 403 
                });
            }

            return res.status(403).render('forum_error.ejs', { layout: false, returnStatus : 403 });        
        }

        next();
    }
    
};


module.exports = user_check;