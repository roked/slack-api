//import of slack web api package
import pkg from '@slack/web-api';

//get the webclient function from the pkg
const {WebClient} = pkg;

// Read a token from the environment variables
//TODO - remove token from here ( it can't be sore in .env when using Webstorm
const slackToken = process.env.SLACK_TOKEN || 'xoxb';
console.log(slackToken)

// Initialize web client
const web = new WebClient(slackToken)

//this function will get the selected channels and send a message
//TODO - add a send file option
//TODO - add a loop to send a message in every channel in param - selectedChannelsId
export async function sendMessageToSelectedChannels(req, res, next) {

    //the test channel
    //TODO - store all channels (attached to the business)
    const selectedChannelsId = ['slack-api'];

    //Get the message from the req.params
    const { message } = req.query;
    console.log(message)

    // Post a message to the channel, and await the result.
    const result = await web.chat.postMessage({
        text: message,
        channel: selectedChannelsId[0]
    });

    // The result contains an identifier for the message, `ts`.
    console.log(`Successfully send message ${result.ts} in conversation ${selectedChannelsId[0]}`);

    await next;
}