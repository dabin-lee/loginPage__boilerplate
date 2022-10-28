const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //스페이스를 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: { //토큰 유효기간
        type: Number
    }
})


//user모델에 register route에 있는 user정보를 저장하기 전에 pre를 한다.
// 해당 pre함수가 다 끝난 후엔 next에 보냄
// next는 register route에 있는 user정보
userSchema.pre('save', function (next) {
    var user = this;

    if (user.isModified('password')) {
        //모델 필드 안에 password만 변환될 때만 
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)//에러일경우 next로 보내줌

            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})



// 로그인
userSchema.methods.comparePassword = function (plainPassword, cb) {
    // plainPassword 1234567 
    // db안에 있는 암호화된 비번: 

    // 먼저 암호화 해서 db비번이랑 비교해야한다.
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err),
            cb(null, isMatch) //에러는 없고null , 매치가 됨 (isMatch = true)
    })
}

// 토큰생성 메소드
userSchema.methods.generateToken = function (cb) {

    var user = this; //es5

    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken');  //secretToken은 내가 아무거나 만들어줌

    // user._id + 'secretToken' = token

    user.token = token //user filed에 있는 token부분에 sign으로 만든 token넣어주기
    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user) //index.js에 있는 user정보
    })

}

// 암호 복호화 메소드 (Auth에서 쓰임)
userSchema.methods.findMyToken = function (token, cb) {
    var user = this;

    // 가져온 token 토큰을 decode함
    //jsonwebtoken 공식사이트 참고
    jwt.verify(token, 'secretToken', function (err, decode) {
        //// user._id를 만들 때 사용했던 secretToken
        // decode는 토큰 때 사용했던 user._id 


        //유저 아이디를 이용해서 유저를 찾은 다음 
        // 클라이언트에서 가져온 토큰과 db에 보관된 토큰이 일치하는 지 확인


        //findOne는 mongoDB method
        user.findOne({ "_id": decode, "token": token }, function (err, cb) {
            if (err) return cb(err)
            cb(null, user)//에러 없으면 user정보 전달
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }
// 모듈을 다른곳에도 사용할 수 있도록 export