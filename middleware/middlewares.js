/**
 * @description A module containing all middlewares and some functions
 * @description Using '@slack/web-api' in order to access the Slack API
 * @author Mitko Donchev
 */
import pkg      from '@slack/web-api';
import Business from '../models/business.js';

//get the webclient function from the web api
const {WebClient} = pkg;

//Read the slack bot token from the environment variables
//TODO - remove token from here ( it can't be sore in .env when using Webstorm )
const slackToken = process.env.SLACK_TOKEN || 'slack-bot-token';

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

        //in case there is no attachments
        if(typeof attachment === 'undefined'){
            attachment = [{}]; //assign empty attachment
        }

        //send a message (and optional attachment) to that specific channel (declared at the bottom of the file)
        await sendMessage(message, attachment, channel);
        await next;
        res.status(200).send(`Message is successfully sent to ${channel}`);
    } catch (err) {
        //in case send message fails or channel/message is missing
        res.status(400).send("Something went wrong. Please check information provided again.");
    }
}

//this middleware will get all channels linked to the business ID and send a message
export async function sendMessageToAllChannels(req, res) {

    //get business ID (get the id from req.params)
    const {id} = req.params;

    //check the DB if the business id exists
    let business = await Business.findById(id).then().catch(err => {
        res.status(400).send("Business ID is missing or wrong. Please try again.")
        console.log(err);
    });

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
            }
            res.status(200).send("Message is successfully sent to all channels.");
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
export async function addChannel(req, res, next) {
    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const {channel} = req.query;

    //get business ID (get the id from req.params)
    const {id} = req.params;

    //if id is empty it throws an error
    if(typeof id === 'undefined') {
        missingID(res);
    }

    //check the DB if the business id exists
    let business = await Business.findById(id).then().catch(() => {
        //business id does not exist or wrong
        missingID(res);
    });

    if(business) {
        //get channels linked to business object and modify the array
        const businessCh = business.channels;

        //make sure no duplicates exist
        for(const c of businessCh){
            if(c === channel){
                res.status(400).send("Channel is already mapped to this account. Please try again.");
                return;
            }
        }

        //add new channel to the old ones
        businessCh.push(channel);
        try{
            await Business.findByIdAndUpdate(id, business, (err, updated) => {
                if(err || !updated){
                    res.status(400).send("Fail to add new channel. Please try again.")
                    console.log(err);
                } else {
                    res.status(200).send("New channel successfully added.");
                    return next;
                }
            });
        } catch (err) {
            console.log(err);
        }
    }

    //TODO - add new business and share id to the code if needed
    //ifbusiness is undefined
    //add new business to the DB (declared at the bottom of the file)
    // try {
    //     let newBusiness = await createNewBusiness(channel, res);
    //     res.status(200).send(`New business successfully created. ID: ${newBusiness}`);
    // } catch(err) {
    //     res.status(400).send("Fail to create new business. Please try again.");
    // }
    // await next();
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
        await web.conversations.list().then(channels => {
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

//this function will add new Business to the DB
async function createNewBusiness(channel) {
    //add new business to the DB with a channel
    //init new business object from Business Model
    let newBusiness = new Business();
    //add information to the object
    newBusiness.channels.push(channel);
    try {
        //add new business with a channel
        newBusiness.save().then(() => {
            console.log(newBusiness);
            return newBusiness;
        }).catch(err => {
            console.log(err);
        });
    } catch (err) {
        console.log(err);
    }
}

//wrong or missing ID
function missingID(res) {
    res.status(400).send("Business ID is missing or wrong. Please try again.")
}
