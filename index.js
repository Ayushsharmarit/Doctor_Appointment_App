const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
require('dotenv').config()
const path = require('path');
const port = process.env.PORT;
const db = require('./src/db/connect')
// Middleware setup
app.use(helmet()); 
app.use(cors());
db()   
app.use(express.json(), express.urlencoded());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const userRouter = require('./src/router/userRouter')
const appointmentRouter = require('./src/router/appointmentRouter')
app.use('/user', userRouter)
app.use('/appointment', appointmentRouter)
// unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1); 
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
