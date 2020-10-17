/**
 * @description An API Gateway. Controls the flow between Client and Services.
 * @description Using 'express-gatewat'
 * @author Mitko Donchev
 */
import path, {dirname} from 'path';
import gateway from 'express-gateway';
import mongoose from "mongoose";
import {fileURLToPath} from "url";
import './routes/api/messages.js';
import './rotues/api/channels.js';

//fileURLToPath() function ensures the correct decoding of percent-encoded
// characters as well as ensuring a cross-platform valid absolute path string.
const __filename = fileURLToPath(import.meta.url);
//The path.dirname() method returns the directory name of a path
const __dirname = dirname(__filename);

//TODO - move the db uri from here
let connectUri = process.env.URL || 'mongodb://localhost:27017/channels_db';

//TODO - import
//Connect to the db
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

//Run the gateway combining the two services and using the config file
//Please check /config/gateway.config.json for the set up
gateway().load(path.join(__dirname, './config')).run();