const express = require('express')
const { requireAuth, requireAdmin } = require('../../middlewares/requireAuth.middleware')
const { log } = require('../../middlewares/logger.middleware')
const { addBoard, getBoards, getBoard, deleteBoard, updateBoard } = require('./board.controller')
const router = express.Router()

router.get('/',  getBoards)
// requireAuth,
router.get('/:boardId', getBoard)
// , requireAuth

router.put('/',  updateBoard)
// requireAuth,
router.post('/',  addBoard)
// requireAuth,
router.delete('/:id',  deleteBoard)
// requireAuth,

module.exports = router
