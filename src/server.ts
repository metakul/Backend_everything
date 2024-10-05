import express, { Express} from 'express';
import cors from 'cors';
import router from './Routes/index.js';
import config from "../config.js"
import {loggerMiddleware} from './Helpers/Logger/logger.js';
import { isDatabaseHealthy } from './db/client.js';
import bodyParser from 'body-parser'

const PORT = config.PORT

const app: Express = express();

app.use(express.json());

// cors
app.use(cors({
  origin: '*', // or specify the domain explicitly
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Payload limit 10MB or more
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

//conect db
isDatabaseHealthy()

// middleware logger
app.use("/", loggerMiddleware());

// Route for handling /did requests
app.use("/", router);


const IP = "0.0.0.0"

// Start the server
app.listen(PORT as number, IP, () => {
    console.log(`Server is running on http://${IP}:${PORT}`);
});

