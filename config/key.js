if (process.env.NODE_ENV === '') {
    module.exports = require('./prod')
} else {
    module.exports = require('./dev')
}
// DEV라면 환경변수가 development로 Deploy라면 production