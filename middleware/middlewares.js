//import of slack web api package
import pkg      from '@slack/web-api';
import Business from '../models/business.js';

//get the webclient function from the pkg
const {WebClient} = pkg;

//Read a token from the environment variables
//TODO - remove token from here ( it can't be sore in .env when using Webstorm )
const slackToken = process.env.SLACK_TOKEN || 'xoxb-1455276216688-1431663829427-q3gCAw3CQ3dIfgaJwIgojyY1';
console.log(slackToken)

//Initialize web client
const web = new WebClient(slackToken)

//=================================//
//MIDDLEWARES USED IN MESSAGES CALLS
//=================================//

//this middleware will get the selected channel and send a message
//it will confirm if channel is valid using 'channelValidator' middleware
//TODO - add a send attachments option
export async function sendMessageToSelectedChannel(req, res, next) {
    //user selected channel
    const {channel} = req.query;

    try{
        //Get the message from the req.params
        const {message} = req.query;
        console.log(message)

        //TODO - send attachments also
        //send the message to that specific channel (declared at the bottom of the file)
        await sendMessage(message, channel);
        await next;
        res.status(200).send(`Message is successfully sent to ${channel}`);
    } catch (err) {
        res.status(400).send("Something went wrong.");
    }

}

//this middleware will get all channels linked to the user and send a message
//TODO - add a send attachments option
export async function sendMessageToAllChannels(req, res, next) {

    //get business (using the name from req.query)
    const { id } = req.query;

    //check the DB if the business id exists
    let business = await Business.find({ _id: id }).then().catch(err => {
        res.status(400).send("Business ID is missing or wrong. Please try again.")
        console.log(err);
    });

    //if everything is fine
    if(business){
        //store all channels (linked to the business)
        const allChannelsName = business[0].channels;

        //loop to send the message in every channel in param - selectedChannelsId
        //TODO - send attachments also
        try{
            for(const channel of allChannelsName){
                //Get the message from the req.params
                const { message } = req.query;

                //send the message to that specific channel (declared at the bottom of the file)
                await sendMessage(message, channel);
                res.status(200).send("Message is successfully sent to all channels.");
            }
        } catch (err) {
            res.status(400).send("Something went wrong.");
        }

    } else {
        res.status(400).send(`${id} does not exist.`)
    }
}

//=================================//
//MIDDLEWARES USED IN CHANNELS CALLS
//=================================//

//this middleware will verify if a channel exists
export async function channelValidation(req, res, next) {
    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const { channel } = req.query;

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

//this middleware will add a channel (existing) to the DB
//validation is done by the previous middleware attached to the same endpoint
export async function addChannel(req, res, next) {
    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const { channel } = req.query;

    //TODO - remove this log
    Business.find({}, (err, all) => {
        console.log(all);
    });

    //get business id from the req.params
    const { id } = req.query;

    //if id is empty it throws an error
    if(typeof id === 'undefined') {
        console.log('Business ID is missing or wrong')
        res.status(400).send("Business ID is missing or wrong. Please try again.")
    }

    //check the DB if the business id exists
    let business = await Business.find({ _id: id }).then().catch(err => {
        res.status(400).send("Business ID is missing or wrong. Please try again.")
        console.log(err);
    });

    if(business) {
        //get business object and modify it
        const modBusiness = business[0];
        //get the id of the existing business
        const id = modBusiness._id;
        const businessCh = modBusiness.channels;

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
            await Business.findByIdAndUpdate(id, modBusiness, (err, updated) => {
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
    //if business is undefined
    //add new business to the DB (declared at the bottom of the file)
    // try {
    //     let newBusiness = await createNewBusiness(channel, res);
    //     res.status(200).send(`New business successfully created. ID: ${newBusiness}`);
    // } catch(err) {
    //     res.status(400).send("Fail to create new business. Please try again.");
    // }
    // await next();
}

//==============//
//OTHER FUNCTIONS
//==============//

//this function will post a message to existing channel/channels
async function sendMessage(message, channel) {
    try {
        //post a message to the channel then work with the promise
        await web.chat.postMessage({
            text: message,
            channel: channel,
            attachments: [{"pretext": "pre-hello", "text": "text-world"}]
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

