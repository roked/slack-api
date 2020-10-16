//import of slack web api package
import pkg from '@slack/web-api';

//get the webclient function from the pkg
const {WebClient} = pkg;

// Read a token from the environment variables
//TODO - remove token from here ( it can't be sore in .env when using Webstorm
const slackToken = process.env.SLACK_TOKEN || 'xoxb-';
console.log(slackToken)

// Initialize web client
const web = new WebClient(slackToken)

//=================================//
//MIDDLEWARES USED IN MESSAGES CALLS
//=================================//

//this function will get the selected channels and send a message
//TODO - add a send file option
export async function sendMessageToSelectedChannels(req, res, next) {

    //the test channel
    //TODO - store all channels (selected by user)
    const selectedChannelsName = ['slack-api'];

    //loop to send the message in every channel in param - selectedChannelsId
    //TODO - send all files also
    for(const channel of selectedChannelsName){
        //Get the message from the req.params
        const { message } = req.query;
        console.log(message)

        // Post a message to the channel, and await the result.
        const result = await web.chat.postMessage({
            text: message,
            channel: channel
        });

        // The result contains an identifier for the message, `ts`.
        console.log(`Successfully send message ${result.ts} in conversation ${channel}`);
    }

    await next;
}

//this function will get all channels linked to the user and send a message
//TODO - add a send file option
export async function sendMessageToAllChannels(req, res, next) {

    //the test channel
    //TODO - store all channels (linked to user)
    const allChannelsName = ['slack-api'];

    //loop to send the message in every channel in param - selectedChannelsId
    //TODO - send all files also
    for(const channel of allChannelsName){
        //Get the message from the req.params
        const { message } = req.query;
        console.log(message)

        // Post a message to the channel, and await the result.
        const result = await web.chat.postMessage({
            text: message,
            channel: channel
        });

        // The result contains an identifier for the message, `ts`.
        console.log(`Successfully send message ${result.ts} in conversation ${channel}`);
    }
    await next;
}

//=================================//
//MIDDLEWARES USED IN CHANNELS CALLS
//=================================//

//this function will verify if a channel exists
export async function channelValidation(req, res, next) {

    //channel requested to be mapped with to the business
    //get the channel name from the req.params
    const { channelName } = req.query;

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
    for(const channel of allChannels) {
        if (channel.name === channelName) {
            console.log(`${channelName} is a valid channel`);
            return await next;
        }
    }

    console.log(`${channelName} does not exists`);
}
