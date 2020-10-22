/**
 * @description This js file contains all endpoints responsible for posting a message
 * @description Using 'express'
 * @author Mitko Donchev
 */
import express from 'express';
import multer from 'multer';

//temp store the file/s
const upload = multer({dest: '../../uploads/'});

//import the middlewares
import {channelValidation, sendMessageToSelectedChannel, sendMessageToAllChannels} from '../../middleware/middlewares.js'

let app = express();

//On this endpoint a message (and attachment) will be sent to selected channel
app.get('/message', upload.array('file', 12), channelValidation, sendMessageToSelectedChannel);

//On this endpoint a message (and attachment) will be sent to all channels linked to the business ID
app.get('/message/:id', upload.array('file', 12), sendMessageToAllChannels);

//run the server on port 3333
app.listen(3333, () => {
    console.log('Server running on 3333');
})