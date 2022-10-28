const express = require('express') //npm으로 설치한 expess 모듈을 가져옴
const app = express() //새로 express앱을 만든다.
const port = 3001

const { User } = require("./models/User");
const mongoose = require('mongoose')
const bodyParser = require('body-parser');
const cookiParser = require('cookie-parser')
const config = require('./config/key')
const { auth } = require('./middleware/auth')


// application/x-www-form-urlencoded 이런식의 데이터를 분석해서 가져올 수 있도록 
app.use(bodyParser.urlencoded({ extended: true }))

// application json타입으로 된 것을 분석해서 가져올 수 있도록
app.use(bodyParser.json())
app.use(cookiParser())

mongoose
    .connect(config.mongoURI, {
        useNewUrlParser: true, useUnifiedTopology: true
    })
    .then(() => console.log('mongoDB Connected...'))
    .catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Hello World!')
})


// 회원가입을 위한 라우터 생성
app.post('api/user/register', (req, res) => {
    // 회원가입에 필요한 정보들을 클라이언트에서 가져오면
    // 해당 data를 database에 저장한다.

    // 만들어놓은 models을 가져와서 인스턴스를 생성한다.
    // bodyparser가 클라이언트에서 가져온 정보를 서버가 분석해서 가져올 수 있게
    const user = new User(req.body)

    // save전에 비밀번호 암호화가 필요함 (유저 모델에 pre함수로 암호화 만듬)

    // mongoDB method: save() / 클라이언트 User정보들이 user모델에 저장됨
    user.save((err, userInfo) => { //err와 방금 저장한 user information
        // 에러가 있을 경우 json으로 전달해줌
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    }) //mongoDB method - req.body정보들이 user모델에 저장됨
})


// 로그인 라우터
app.post('api/user/login', (req, res) => {
    // 1.요청된 이메일을 데이터베이스에서 찾음
    //유저 모델을 가저온 후 findeOne을 이용해서 찾으려는 이메일을 찾는다. 

    User.findOne({ email: req.body.email }, (err, user) => {
        //찾고자하는 요청된 이메일, 콜백펑션에는 err와 user
        //만약에 User컬렉션 안에 요청된 email을 가진 유저가 한명도 없다면 user의 반환값은 loginSuccess: false
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: '가입된 회원이 아닙니다.'
            })
        }

        // 2.요청한 이메일이 데이터베이스에 있다면 비밀번호가 같은지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            //comparePassword는 user model에서 만듬
            if (!isMatch)
                return res.json({ loginSuccess: false, message: '비밀번호가 일치하지 않습니다.' })

            // 3.비밀번호까지 같다면 해당 유저를 위한 token생성
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err)

                //토큰을 저장한다. 쿠키, 로컬스토리지 등등.. 에 
                // cookieparser 설치

                res.cookie("x_auth", user.token) //x_auth는 내가 지정하는 쿠키에 들어가는 이름
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})



// auth 미들웨어 라우터
// 엔드포인트 받고 콜백 실행 중 auth라는 미들웨어를 먼저 실행시킴
app.get('api/user/auth', auth, (req, res) => {
    // 여기까지 미들웨어를 통과해왔다는 얘기는 authentication이 true임

    req.status(200).json({
        //auth에 있는 req넣은 user
        _id: req.user.id,
        // role이 0 이면 일반유저 그 외에는 admin
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


// "email": "dandi22@gmail.co.kr",
// "password" : "asdfasdf"