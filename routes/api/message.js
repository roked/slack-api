import express from 'express';

let app = express();

app.get('/messages', (req,res,next) => {
    res.status(200).send(["You will send a message soon!"]);
})

app.listen(8000, () => {
    console.log('Server running on 8000')
})