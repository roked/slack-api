import express from "express";
import httpProxy from 'http-proxy';

const router = express.Router();

const apiProxy = httpProxy.createProxyServer({target:'http://localhost:9000'});

router.get("/", function(req, res){
    apiProxy.web(req, res, { target: 'https://stackoverflow.com/questions/37399964/node-express-api-gateway' });
});

export default router;
