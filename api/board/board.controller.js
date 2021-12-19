const logger = require('../../services/logger.service')
// const userService = require('../user/user.service')
// const socketService = require('../../services/socket.service')
const boardService = require('./board.service')

async function getBoards(req, res) {
    try {
        
        const filterBy = req.query
        console.log('getBoards',filterBy);
        const boards = await boardService.query(filterBy)
        console.log('boards',{boards});
        res.send(boards)
    } catch (err) {
        logger.error('Cannot get boards', err)
        res.status(500).send({ err: 'Failed to get boards' })
    }
}



async function getBoard(req, res) {
    try {
        const board = await boardService.getById(req.params.boardId)
        res.send(board)
    } catch (err) {
        logger.error('Cannot get board', err)
        res.status(500).send({ err: 'Failed to get board' })
    }
}

async function deleteBoard(req, res) {
    try {
        await boardService.remove(req.params.boardId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete board', err)
        res.status(500).send({ err: 'Failed to delete board' })
    }
}

async function updateBoard(req, res) {
    try {
        const board = req.body
        const savedBoard = await boardService.update(board)
        // console.log('savedBoard',savedBoard);
        // socketService.broadcast({ type: 'board-updated', data: board._id, room: board._id })
        res.send(savedBoard)
    } catch (err) {
        logger.error('Failed to update board', err)
        res.status(500).send({ err: 'Failed to update board' })
    }
}

async function addBoard(req, res) {
    try {
        var {board} = req.body
        // console.log(board);
        board = await boardService.add(board)
        // socketService.broadcast({type: 'board-added', data: board})
        res.send(board)
    } catch (err) {
        console.log(err)
        logger.error('Failed to add board', err)
        res.status(500).send({ err: 'Failed to add board' })
    }
}

module.exports = {
    getBoards,
    getBoard,
    deleteBoard,
    addBoard,
    updateBoard
}