const { User } = require("../models/User")

let auth = (req, res, nex) => {


    // 인증 처리를 하는 곳

    // 1.클라이언트 쿠키에서 토큰을 가져온다. 
    let token = req.cookies.x_auth //cookiParser
    // 쿠키를 넣을때 x_auth 라는 이름을 사용했었음

    // 2.토큰을 복호화 한 후 유저를 찾는다.
    //Use models에서 만든 메소드를 불러와서 사용
    User.findMyToken(token, (err, user) => {
        if (err) throw err

        // 유저가 
        if (!user) return res.json({ isAuth: false, error: true })

        //유저가 있다면 
        req.token = token
        req.user = user
        next();// next가 없으면 미들웨어에서 닫혀버림
    })

    // 유저가 있으면 인증 ok

    // 유저가 없다면 no

}

module.exports = { auth }