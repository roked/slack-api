import express from 'express';
import { sendMessageToSelectedChannels } from '../../middleware/middlewares.js'
let app = express();

app.get('/messages', sendMessageToSelectedChannels, (req, res) => {
    res.status(200).send(["A message was sent!"]);
})

app.listen(8000, () => {
    console.log('Server running on 8000');
})