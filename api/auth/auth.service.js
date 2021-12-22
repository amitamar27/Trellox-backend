const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')

// const saltRounds = 10;
// const myPlaintextPassword = 's0/\/\P4$$w0rD';
// const someOtherPlaintextPassword = 'not_bacon';

// import bcrypt from 'bycrypt'
async function login(email, password) {
    logger.debug(`auth.service - login with email: ${email}`)
    const user = await userService.getByEmail(email)
    if (!user ) return Promise.reject('Invalid email or password user')
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid email or password pass')

    delete user.password
    return user
}
async function generateHash(password){
    // const salt  = bcrypt.genSaltSync(10);
    const salt = 10;
    const hash = await bcrypt.hash(password,salt)
    return hash
}
async function signup(email, password, fullname, boardsIds) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with email: ${email}, fullname: ${fullname}`)
    if (!email || !password || !fullname) return Promise.reject('fullname, email and password are required!')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ email, password: hash, fullname, boardsIds })
}

module.exports = {
    signup,
    login,
}