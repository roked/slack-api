import { fileURLToPath } from 'url';
import { dirname }       from 'path';
import express           from 'express';
import logger            from 'morgan';
import path              from 'path';
import bodyparser        from 'body-parser'
// import config            from 'config';
// import http              from 'http';

const app = express();

import { log, normalizePort } from './utils.js';
import router from "../routes/apigateway.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router)

app.listen(3000, () => {
    console.log('Server running on 3000');
})

export default app
