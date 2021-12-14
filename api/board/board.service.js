const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger = require('../../services/logger.service')
// const socketService = require('../../services/socket.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('boards')
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
        const board = await collection.findOne({ '_id': ObjectId(boardId) })
        return board
    } catch (err) {
        logger.error(`while finding board ${boardId}`, err)
        throw err
    }
}

async function remove(boardId) {
    try {
        const collection = await dbService.getCollection('boards')
        const query = { _id: ObjectId(boardId) }
        await collection.deleteOne(query)
    } catch (err) {
        logger.error(`cannot remove board ${boardId}`, err)
        throw err
    }
}

async function update({board}) {

    try {
        const boardToSave = {
            ...board,
            _id:ObjectId(board._id)
        }
        const collection = await dbService.getCollection('boards')
        await collection.updateOne({ _id: boardToSave._id }, { $set: boardToSave })
        return board
    } catch (err) {
        logger.error(`cannot update board ${board._id}`, err)
        throw err
    }
}

async function add(board) {
    try {
        // board.createdAt = Date.now()
        // console.log('board service',board);
        // console.log('board labels',board.labels);
        // if (board.isStared === undefined) board.isStared = false
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

async function save(board) {
    // console.log('saving...',board);
    const { title, createdBy, style, labels, members, groups, activities,covers } = board
    // console.log('covers',covers);
    let savedBoard
    console.log('board._id',board._id);
    if (board._id) {
       try {
          savedBoard = {
             _id: ObjectId(board._id),
             title,
             createdBy,
             style,
             labels,
             members,
             groups,
             activities,
             covers,
          }
          const collection = await dbService.getCollection('boards')
          await collection.updateOne({ _id: savedBoard._id }, { $set: savedBoard })
          return savedBoard
       } catch (err) {
          logger.error('cannot update board', err)
          throw err
       }
    } else {
       try {
           console.log('else!!!!!!!!!!!!');
          savedBoard = {
             createdAt: ObjectId().getTimestamp(),
             title,
             createdBy,
             style,
             labels,
             members: [createdBy],
             groups,
             activities
          }
          const collection = await dbService.getCollection('boards')
          await collection.insertOne(savedBoard)
          return savedBoard
       } catch (err) {
          logger.error('cannot add board', err)
          throw err
       }
    }
 }
module.exports = {
    query,
    getById,
    remove,
    update,
    add,
    save
    // addMsg
}