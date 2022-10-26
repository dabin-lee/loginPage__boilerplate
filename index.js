const express = require('express') //npm으로 설치한 expess 모듈을 가져옴
const app = express() //새로 express앱을 만든다.
const port = 3001

const bodyParser = require('body-parser')

const config = require('./config/key')

const { User } = require("./models/User")


// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// application json타입으로 된 것을 분석해서 가져올 수 있도록
app.use(bodyParser.json())

const mongoose = require('mongoose')
const { mongoURI } = require('./config/dev')
mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log('mongoDB Connected...'))
    .catch(err => console.log(err))


app.get('/', (req, res) => {
    res.send('Hello World!')
})


// 회원가입을 위한 라우터 생성
app.post('/register', (req, res) => {
    // 회원가입에 필요한 정보들을 클라이언트에서 가져오면
    // 해당 data를 database에 저장한다.

    // 만들어놓은 models을 가져와서 인스턴스를 생성한다.
    // bodyparser가 클라이언트에서 가져온 정보를 서버가 분석해서 가져올 수 있게
    const user = new User(req.body)

    user.save((err, userInfo) => {
        if (err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    }) //mongoDB method - req.body정보들이 user모델에 저장됨
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
