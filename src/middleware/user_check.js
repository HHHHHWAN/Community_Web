
const user_check = {

    check_login : (req, res, next) => {
        const accept = req.headers['accept'].split(',');
        if(!req.session.user){

            // JSON REQUEST
            if(accept[0] === 'application/json'){
                return res.status(401).json({
                    message: "인증 실패, 허가되지 않은 접근",
                    returnStatus : 401 });
            }

            // EJS REQUEST
            if(accept[0] === 'text/html'){
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
                return res.status(401).json({
                    message: "인증 실패, 허가되지 않은 접근",
                    returnStatus : 401 });
            }

            // EJS REQUEST
            if(accept[0] === 'text/html'){
                return res.redirect('/');
            }

            // 그 외
            return res.status(401).render('forum_error.ejs', { layout: false, returnStatus : 401 });        
        }

        next();

    }
};



module.exports = user_check;