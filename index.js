import pkg from '@slack/web-api';

const {WebClient} = pkg;

// Read a token from the environment variables
const slackToken = process.env.BOT_TOKEN;

// Initialize
const web = new WebClient(slackToken);
const channelId = 'slack-api';

(async () => {

    // Post a message to the channel, and await the result.
    // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
    const result = await web.chat.postMessage({
        text: 'Hello world!',
        channel: channelId,
    });

    // The result contains an identifier for the message, `ts`.
    console.log(`Successfully send message ${result.ts} in conversation ${channelId}`);
})();