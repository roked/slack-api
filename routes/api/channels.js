import express from 'express';
import { channelValidation } from '../../middleware/middlewares.js'

let app = express();

app.get('/channels', channelValidation, (req, res) => {
    res.status(200).send(["Add new channel"]);
})

app.listen(3000, () => {
    console.log('Server running on 3000');
})