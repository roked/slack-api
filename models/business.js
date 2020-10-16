import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const Business = new Schema({
    businessId: ObjectId,
    channels: [{type: String}]
});

//Export the business model
export default mongoose.model('Business', Business);