import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middlewares/error.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Import http to create a server instance
import { Server } from 'socket.io';

dotenv.config({ path: './.env' });

export const envMode = process.env.NODE_ENV?.trim() || 'DEVELOPMENT';
const port = process.env.PORT || 3001;

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*', credentials: true }));
app.use(morgan('dev'));


const httpServer = createServer(app); 


const io = new Server(8000);

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);


});


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.get('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Page not found',
  });
});


app.use(errorMiddleware);

// Start the server with Express and Socket.IO on the same port
httpServer.listen(port, () => {
  console.log(`Server is working on Port: ${port}.`);
});
