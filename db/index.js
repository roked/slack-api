import mongoose from 'mongoose';

//TODO - move the db uri from here
let connectUri = process.env.URL || 'mongodb://localhost:27017/channels_db';

//Connect to Mongoose
export function connectDB(){
    mongoose.connect(connectUri, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false
    }).then(() => {
        console.log("Connected to DB!");
    }).catch(err => {
        console.log("Error: ", err.message);
    });
}
