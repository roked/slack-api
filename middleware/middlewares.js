/**
 * @description A module containing all middlewares and some functions
 * @description Using '@slack/web-api' in order to access the Slack API
 * @author Mitko Donchev
 */
import pkg        from '@slack/web-api';
import Business   from '../models/business.js';
import fs         from 'fs';

//get the webclient function from the web api
const {WebClient} = pkg;

//Read the slack bot token from the environment variables
//TODO - remove token from here ( it can't be sore in .env when using Webstorm )
const slackToken = process.env.SLACK_TOKEN || 'xoxb-1455276216688-1431663829427-utgeq4KaEwI45rAhUOuweT31';

//Initialize web client
const web = new WebClient(slackToken)

//=================================//
//MIDDLEWARES USED IN MESSAGES CALLS
//=================================//

//this middleware will get a selected channel and send a message
//channel validation is done by 'channelValidator' middleware (part of endpoint middlewares)
export async function sendMessageToSelectedChannel(req, res, next) {
    try{
        const {channel} = req.query;  //user selected channel
        const {message} = req.query;  //message to send
        let {attachment} = req.query; //attachment
        //get an array of al files uploaded
        const files = req.files;

        //in case there is no attachments
        if(typeof attachment === 'undefined'){
            attachment = [{}]; //assign empty attachment
        }

        //send a message (and optional attachment) to that specific channel (declared at the bottom of the file)
        await sendMessage(message, attachment, channel);

        //if files array is not empty
        if(files){
            //send every file to the channel
            for(const file of files){
                await sendFiles(channel, file);
            }
        }

        await next;
        res.status(200).send(`Message and files are successfully sent to ${channel}`);
    } catch (err) {
        //in case send message fails or channel/message is missing
        res.status(400).send("Something went wrong. Please check information provided again.");
    }
}

//this middleware will get all channels linked to the business ID and send a message
export async function sendMessageToAllChannels(req, res, next) {
    //get business ID (get the id from req.params)
    const {id} = req.params;
    //get an array of al files uploaded
    const files = req.files;

    //check the DB if the business id exists
    let business = await Business.findById(id).then().catch(err => {
        res.status(400).send("Business ID is missing or wrong. Please try again.")
        console.log(err);
    });

    console.log(business)

    //if everything is fine
    if(business){
        //store all channels (linked to the business)
        const allChannels = business.channels;

        //loop to send a message (and optional attachment) in every channel in allChannels
        try{
            for(const channel of allChannels){
                //Get the message from the req.params
                const {message} = req.query;
                let {attachment} = req.query;

                //in case there is no attachments
                if(typeof attachment === 'undefined'){
                    attachment = [{}];
                }
                //send the message to that specific channel (declared at the bottom of the file)
                await sendMessage(message, attachment, channel);

                //if files array is not empty
                if(files){
                    //send every file to the channel
                    for(const file of files){
                        await sendFiles(channel, file);
                    }
                }
            }
            res.status(200).send("Message and files are successfully sent to all channels.");
            await next();
        } catch (err) {
            res.status(400).send("Something went wrong.");
        }
    } else {
        //the id is wrong or doesn't exist
        res.status(400).send(`${id} does not exist or it is wrong.`)
    }
}

//=================================//
//MIDDLEWARES USED IN CHANNELS CALLS
//=================================//

//this middleware will add a channel (existing) to the DB
//validation is done by the previous middleware attached to the same endpoint
export async function addChannel(req, res) {
    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const {channel} = req.query;

    //get business ID (get the id from req.params)
    const {id} = req.query;

    //if id is empty it throws an error
    if(typeof id === 'undefined') {
        //if business is undefined
        try {
            //add new business to the DB (declared at the bottom of the file)
            let business = await createNewBusiness();
            //map new channel to the business (declared at the bottom of the file)
            await addNewChannel(business, channel).then(() => {
                res.status(200).send(`New business successfully created. ID: ${business._id} and channel is mapped to it`);
            });
        } catch(err) {
            res.status(400).send("Fail to create new business. Please try again.");
            console.log(err);
        }
    } else {
        try {
            //check the DB if the business id exists
            const business = await Business.find({_id: id}).then().catch((err) => {
                missingID(res, err);
            });
            if (business) {
                //map new channel to the business (declared at the bottom of the file)
                await addNewChannel(business[0], channel).then(() => {
                    res.status(200).send(`New channel ${channel} mapped to the Business`);
                });
            }
        } catch(err) {
            res.status(400).send("Fail to link new channel. Please try again.");
        }
    }
}

//======================================//
//MIDDLEWARES USED FOR CHANNEL VALIDATION
//======================================//

//this middleware will verify if a channel exists
export async function channelValidation(req, res, next) {
    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const {channel} = req.query;

    //gat a lists of all channels in a Slack team.
    let allChannels;
    try{
        //set types of channels to get public and private
        await web.conversations.list({
            types: 'public_channel, private_channel'
        }).then(channels => {
            //store all channels
            allChannels = channels.channels;
            console.log(`${allChannels}`);
        }).catch(err => {
            console.log(err);
        })
    } catch(err) {
        console.log("Not a valid request");
        console.log(err);
    }

    //Try to check the existence of the channel by lopping in allChannels collection
    //If the channel.name is equal to the user specified channelName - channel exist and vice versa
    for(const c of allChannels) {
        if (c.name === channel) {
            console.log(`${channel} is a valid channel`);
            return await next();
        }
    }
    res.status(400).send(`${channel} does not exist.`)
}

//==============//
//OTHER FUNCTIONS
//==============//

//this function will post a message to existing channel/channels
async function sendMessage(message, attachment, channel) {
    try {
        //post a message to the channel then work with the promise
        await web.chat.postMessage({
            text: message,
            channel: channel,
            attachments: attachment
        }).then(result => {
            // The result contains an identifier for the message, `ts`.
            console.log(`Successfully send message ${result.ts} in conversation ${channel}`);
        }).catch(err => {
            console.log(err);
        });
    } catch (err) {
        console.log(err);
    }
}

//this function can send multiple files
async function sendFiles(channel, file) {
    try {
        //post files to the channel then work with the promise
        await web.files.upload({
            channels: channel,
            file: fs.createReadStream(file.path)
        }).then(result => {
            console.log(`../uploads/${file.filename}`);
            // The result contains an identifier for the message, `ts`.
            console.log(`Successfully send a file in conversation ${channel}`);
        }).catch(err => {
            console.log(`Bot doesn't have access to ${channel}`);
            console.log(err);
        });
    } catch (err) {
        console.log(err);
    }
}


//this function will add new Business to the DB
async function createNewBusiness() {
    //add new business to the DB with a channel
    //init new business object from Business Model
    let newBusiness = new Business();
    try {
        //add new business with a channel
        await newBusiness.save().then(() => {
            console.log(newBusiness);
        }).catch(err => {
            console.log(err);
        });
    } catch (err) {
        console.log(err);
    }

    return newBusiness;
}

//this function will map new channel to the business
async function addNewChannel(business, channel) {
    //make sure no duplicates exist
    for (const c of business.channels) {
        if(typeof c === 'undefined'){
            break;
        }
        if (c === channel) {
            return;
        }
    }

    //add new channel to the old ones
    business.channels.push(channel);
    try {
        await Business.findByIdAndUpdate(business._id, business, (err, updated) => {
            if (err || !updated) {
                console.log(err);
            } else {}
        });
    } catch (err) {
        console.log(err);
    }
}

//wrong or missing ID
function missingID(res, err) {
    res.status(400).send("Business ID is missing or wrong. Please try again.")
    console.log(err);
}
