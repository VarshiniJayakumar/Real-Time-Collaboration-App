const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join Board Room
    socket.on('board:join', ({ boardId, user }) => {
      socket.join(`board:${boardId}`);
      console.log(`User ${user?.username} (${socket.id}) joined board room: board:${boardId}`);
      
      // Notify others that a user joined
      socket.to(`board:${boardId}`).emit('board:user-joined', { user });
    });

    // Leave Board Room
    socket.on('board:leave', ({ boardId, user }) => {
      socket.leave(`board:${boardId}`);
      console.log(`User ${user?.username} (${socket.id}) left board room: board:${boardId}`);
      socket.to(`board:${boardId}`).emit('board:user-left', { user });
    });

    // Task Reordering or Column Moving
    socket.on('task:move', ({ boardId, updatedBoard }) => {
      console.log(`Task moved on board: ${boardId}`);
      // Broadcast the full updated board configuration to other clients
      socket.to(`board:${boardId}`).emit('task:moved', { updatedBoard });
    });

    // Task details updated
    socket.on('task:update', ({ boardId, task }) => {
      console.log(`Task updated on board: ${boardId}, task: ${task._id}`);
      socket.to(`board:${boardId}`).emit('task:updated', { task });
    });

    // Task comments added
    socket.on('comment:add', ({ boardId, taskId, comment }) => {
      console.log(`Comment added on task: ${taskId} inside board: ${boardId}`);
      socket.to(`board:${boardId}`).emit('comment:added', { taskId, comment });
    });

    // User typing indicators
    socket.on('task:typing', ({ boardId, taskId, username }) => {
      socket.to(`board:${boardId}`).emit('task:typing', { taskId, username });
    });

    socket.on('task:stop-typing', ({ boardId, taskId, username }) => {
      socket.to(`board:${boardId}`).emit('task:stop-typing', { taskId, username });
    });

    // Board configuration modified (e.g. Columns reordered, Column added, Board renamed)
    socket.on('board:update', ({ boardId }) => {
      console.log(`Board updated: ${boardId}`);
      socket.to(`board:${boardId}`).emit('board:updated');
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
