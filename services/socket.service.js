const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null
var gSocketBySessionIdMap = {}
// function connectSockets(http, session) {
//     gIo = require('socket.io')(http, {
//         cors: {
//             origin: '*',
//         }
//     })
//     gIo.on('connection', socket => {
//         console.log('New socket', socket.id)
//         socket.on('disconnect', socket => {
//             console.log('Someone disconnected')
//         })
//         socket.on('chat topic', topic => {
//             if (socket.myTopic === topic) return;
//             if (socket.myTopic) {
//                 socket.leave(socket.myTopic)
//             }
//             socket.join(topic)
//             socket.myTopic = topic
//         })
//         socket.on('chat newMsg', msg => {
//             console.log('Emitting Chat msg', msg);
//             // emits to all sockets:
//             // gIo.emit('chat addMsg', msg)
//             // emits only to sockets in the same room
//             gIo.to(socket.myTopic).emit('chat addMsg', msg)
//         })
//         socket.on('user-watch', userId => {
//             socket.join('watching:' + userId)
//         })
//         socket.on('set-user-socket', userId => {
//             logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
//             socket.userId = userId
//         })
//         socket.on('unset-user-socket', () => {
//             delete socket.userId
//         })

//     })
// }


function connectSockets(http, session) {
    // gIo = require('socket.io')(http)
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    const sharedSession = require('express-socket.io-session')

    gIo.use(sharedSession(session, {
        autoSave: true
    }))
    gIo.on('connection', socket => {
        // console.log('New socket', socket.id)
        gSocketBySessionIdMap[socket.handshake.sessionID] = socket
        socket.on('disconnect', socket => {
            // console.log('Someone disconnected')
            // console.log('socket :>> ', socket)
            if (socket.handshake) {
                gSocketBySessionIdMap[socket.handshake.sessionID] = null
            }
        })
        socket.on('currBoard', boardId => {
            console.log('boardId sdsds', boardId);
            if (socket.currBoard === boardId) return;
            if (socket.currBoard) {
                socket.leave(socket.myTopic)
            }
            socket.join(boardId)
            socket.boardId = boardId
        })

        socket.on('board update', board => {
            console.log('socket update');
            // gIo.to(socket.currBoard).emit('board updated', board)
            socket.broadcast.to(socket.boardId).emit('board updated', board)
            // emits to all sockets:
            // gIo.emit('chat addMsg', msg)
            // emits only to sockets in the same room
            // gIo.to(socket.topic).emit('chat addMsg', msg)
        })

        // socket.on('board-updated', savedBoard => {
        //     socket.to(socket.boardId).emit('board-updated', savedBoard)
        // })


    })
}

function emitTo({
    type,
    data,
    label
}) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}

async function emitToUser({
    type,
    data,
    userId
}) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket 
function broadcast({
    type,
    data,
    room = null
}) {
    const store = asyncLocalStorage.getStore()
    console.log('store', store);
    const {
        sessionId
    } = store
    console.log('sessionId', sessionId);
    if (!sessionId) return logger.debug('Shoudnt happen, no sessionId in asyncLocalStorage store')
    const excludedSocket = gSocketBySessionIdMap[sessionId]
    if (!excludedSocket) return logger.debug('Shouldnt happen, No socket in map')
    if (room) excludedSocket.broadcast.to(room).emit(type, data)
    else excludedSocket.broadcast.emit(type, data)
}

// async function broadcast({
//     type,
//     data,
//     room = null,
//     userId
// }) {
//     console.log('BROADCASTING', JSON.stringify(arguments));
//     const excludedSocket = await _getUserSocket(userId)
//     if (!excludedSocket) {
//         // logger.debug('Shouldnt happen, socket not found')
//         // _printSockets();
//         return;
//     }
//     logger.debug('broadcast to all but user: ', userId)
//     if (room) {
//         excludedSocket.broadcast.to(room).emit(type, data)
//     } else {
//         excludedSocket.broadcast.emit(type, data)
//     }
// }

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
async function _getAllSockets() {
    // return all Socket instances
    const sockets = await gIo.fetchSockets();
    return sockets;
}
// function _getAllSockets() {
//     const socketIds = Object.keys(gIo.sockets.sockets)
//     const sockets = socketIds.map(socketId => gIo.sockets.sockets[socketId])
//     return sockets;
// }

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}

function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}