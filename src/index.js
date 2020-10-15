//import of slack web api package
import pkg from '@slack/web-api';

//get the webclient function from the pkg
const {WebClient} = pkg;

// Read a token from the environment variables
const slackToken = process.env.BOT_TOKEN;

// Initialize
const web = new WebClient(slackToken)

//the test channel
const channelId = 'slack-api';

(async () => {

    // Post a message to the channel, and await the result.
    const result = await web.chat.postMessage({
        text: 'Hello world!',
        channel: channelId,
    });

    // The result contains an identifier for the message, `ts`.
    console.log(`Successfully send message ${result.ts} in conversation ${channelId}`);
})();