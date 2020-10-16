import express from 'express';
import { addChannel, channelValidation} from '../../middleware/middlewares.js'

let app = express();

app.get('/channels', channelValidation, addChannel);

app.listen(3000, () => {
    console.log('Server running on 3000');
})