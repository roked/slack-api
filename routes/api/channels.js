import express from 'express';

let app = express();

app.get('/channels', (req, res) => {
    res.status(200).send(["Add new channel"]);
})

app.listen(3000, () => {
    console.log('Server running on 3000');
})