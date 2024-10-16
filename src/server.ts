import express, { Express } from 'express';
import cors from 'cors';
import router from './Routes/index.js';
import { loggerMiddleware } from './Helpers/Logger/logger.js';
import { isDatabaseHealthy } from './db/client.js';
import bodyParser from 'body-parser';

const app: Express = express();

// CORS configuration
app.use(cors({
  origin: '*', // or specify the domain explicitly
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'boundary'],
}));

// Payload limit
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Log incoming request body size
app.use((req, res, next) => {
  console.log(`Incoming request body size: ${JSON.stringify(req.body).length} bytes`);
  next();
});

// Connect to the database
isDatabaseHealthy();

// Middleware logger
app.use("/", loggerMiddleware());
//backend Load req
app.get("/", (req, res) => {
  res.send("Website is running");
});
// Route for handling requests
app.use("/", router);

const PORT=process.env.PORT || 3000
// Start the server
app.listen(PORT, function(){
  console.log(`Express server listening on port ${PORT} in localhost`);
});
