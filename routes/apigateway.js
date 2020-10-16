import path, {dirname} from 'path';
import gateway from 'express-gateway';
import './api/messages.js';
import './api/channels.js';
import {fileURLToPath} from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//TODO - move the db uri from here
let connectUri = process.env.URL || 'mongodb://localhost:27017/channels_db';

//TODO - import
//Connect to Mongoose
mongoose.connect(connectUri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log("Connected to DB!");
    }).catch(err => {
        console.log("Error: ", err.message);
    });

gateway()
    .load(path.join(__dirname, '../config'))
    .run();