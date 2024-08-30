import { Server } from "socket.io"

const io = new Server(8000, {
  cors: true,
})

// creating a map function for socket server to know
// which email should be inside which room
const emailToSocketIdMap = new Map()
const socketIdToEmailMap = new Map()

io.on("connection", (socket) => {
  console.log("Socket Connected on:", socket.id)
  socket.on("room:join", (data) => {
    const { email, room } = data
    emailToSocketIdMap.set(email, socket.id)
    socketIdToEmailMap.set(socket.id, email)

    // tells user 1 that user 2 has joined the room
    io.to(room).emit("user:joined", { email, id: socket.id })
    socket.join(room)

    // sending user to the socket.id
    io.to(socket.id).emit("room:join", data)
  })
  // user call ( audio/video )
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer })
  })

  // accepting user's call request ( audio/video )
  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer })
  })

  // negotiation for browser, visit: chrome://webrtc-internals
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer })
  })

  // accept incoming negotiation call
  socket.on("peer:nego:done", ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, answer })
  })
})
