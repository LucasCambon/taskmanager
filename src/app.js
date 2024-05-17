const express = require('express');
require('./services/sheduler');
const taskRoutes = require('./routes/taskRouter');
const userRouter = require('./routes/userRouter');

const app = express();

app.use(express.json());

// Listening port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRouter);
