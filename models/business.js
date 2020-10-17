/**
 * @description This js file contains the business model
 * @description Using 'mongoose'
 * @author Mitko Donchev
 */
import mongoose from 'mongoose';

const Schema = mongoose.Schema;
//get unique ID from the mongoose schema
const ObjectId = Schema.ObjectId;

//create new schema for business
const Business = new Schema({
    businessId: ObjectId,
    channels: [{type: String}]
});

//Export the business model
export default mongoose.model('Business', Business);