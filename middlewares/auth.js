const exp = require('constants');
const fs = require('fs');
const data = fs.readFileSync('./config.json');
const conf = JSON.parse(data);
const SECRET_KEY = conf.secretKey;
const jwt = require('jsonwebtoken');

    exports.auth = (req, res, next) => {
        // 인증 완료
        try {
            // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰을 req.decoded에 반환
            const verified = jwt.verify(req.cookies.token, SECRET_KEY);
            console.log(verified);
            return next();
        }
        // 인증 실패
        catch (error) {
            res.clearCookie('token');
            res.redirect('/login');
        }
    }

    exports.jwtdata = (mycookie) => {
        try {
            const verified = jwt.verify(mycookie, SECRET_KEY);
            return verified;
        }
        catch (error) {
            return null;
        }
    }