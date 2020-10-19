/**
 * @description This js file contains all endpoints responsible for manipulating the mongoDB
 * @description Using 'express'
 * @author Mitko Donchev
 */
import express from 'express';
//import middlewares
import {addChannel, channelValidation} from '../../middleware/middlewares.js'

let app = express();

//On this endpoint a new channel will be mapped
//to the business ID
app.get('/channel', channelValidation, addChannel);

//Start server on port 3000
app.listen(3000, () => {
    console.log('Server running on 3000');
})