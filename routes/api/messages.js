import express from 'express';
import {sendMessageToSelectedChannel, sendMessageToAllChannels} from '../../middleware/middlewares.js'

let app = express();

app.get('/messages', sendMessageToSelectedChannel, (req, res) => {
    res.status(200).send(["A message was sent!"]);
})

app.listen(8000, () => {
    console.log('Server running on 8000');
})