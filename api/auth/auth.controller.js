const authService = require('./auth.service')
const logger = require('../../services/logger.service')

async function login(req, res) {
    console.log('req',req.body);
    const { email, password } = req.body
    console.log('email',email);
    console.log('password',password);
    console.log('req.body',req.body);
    try {
        const user = await authService.login(email, password)
        req.session.user = user
        res.json(user)
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

async function signup(req, res) {
    try {
        console.log('req.body',req.body);
        const {fullname, email, password, boardsIds } = req.body
        // 
        console.log('email, password, fullname,boardsIds',email, password, fullname,boardsIds);
        // Never log passwords
        // logger.debug(fullname + ', ' + email + ', ' + password)
        const account = await authService.signup(email, password, fullname, boardsIds)
        // console.log('account',account);
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
        // console.log('email, password',email, password);
        const user = await authService.login(email, password)
        console.log('user',user);
        req.session.user = user
        res.json(user)
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(500).send({ err: 'Failed to signup' })
    }
}

async function logout(req, res){
    try {
        req.session.destroy()
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(500).send({ err: 'Failed to logout' })
    }
}

module.exports = {
    login,
    signup,
    logout
}