const express = require('express') //npm으로 설치한 expess 모듈을 가져옴
const app = express() //새로 express앱을 만든다.
const port = 3000

const mongoose = require('mongoose')
mongoose
    .connect('mongodb+srv://dabinLEE:abcd1234@petmarking.xttuums.mongodb.net/?retryWrites=true&w=majority')
    .then(() => console.log('mongoDB Connected...'))
    .catch(err => console.log(err))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


// 몽고DB
// USERNAME:dabinLEE PW: ABCE1234

// mongodb+srv://dabinLEE:<password>@petmarking.xttuums.mongodb.net/?retryWrites=true&w=majority