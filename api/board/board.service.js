const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')
// const socketService = require('../../services/socket.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('boards')
        const entersCollection = await dbService.getCollection('enters')
        await entersCollection.insertOne({
            enter: new Date()
        })
        const boards = await collection.find(criteria).toArray()
        return boards
    } catch (err) {
        logger.error('cannot find boards', err)
        throw err
    }
}

async function getById(boardId) {
    try {
        const collection = await dbService.getCollection('boards')
        const board = await collection.findOne({
            '_id': ObjectId(boardId)
        })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('boards')
        const query = {
            _id: ObjectId(boardId)
        }
        await collection.deleteOne(query)
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update({
    board
}) {

    try {
        const boardToSave = {
            ...board,
            _id: ObjectId(board._id)
        }
        const collection = await dbService.getCollection('boards')
        await collection.updateOne({
            _id: boardToSave._id
        }, {
            $set: boardToSave
        })
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function add(board) {
    try {
        const collection = await dbService.getCollection('boards')
        await collection.insertOne(board)
        return board
    } catch (err) {
        logger.error('cannot insert board', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy._id) criteria._id = filterBy._id
    return criteria
}


module.exports = {
    query,
    getById,
    remove,
    update,
    add,

}