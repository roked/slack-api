import path, {dirname} from 'path';
import gateway from 'express-gateway';
import './routes/api/business.js';
import './routes/api/message.js';
import {fileURLToPath} from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

gateway()
    .load(path.join(__dirname, 'config'))
    .run();