# Backend test project for assessment
Based on some events that happen in the back-end of the solution, a message will be sent to relevant slack channels. 
## The micro-service is coded as a RESTful API using

* Mongoose
* ExpressJS
* Official Slack API

####Dependencies

    "@slack/events-api": "2.3.4"
    "@slack/web-api": "5.12.0"
    "body-parser": "^1.19.0"
    "config": "^3.3.2"
    "debug": "~2.6.9"
    "ejs": "~2.6.1"
    "express": "~4.16.1"
    "express-gateway": "^1.16.10"
    "http-proxy": "^1.18.1"
    "mongoose": "^5.10.9"
    
##Steps to run the backend

1. Install all dependencies
2. Add to package.json:   

        "type": "module",
        "scripts": {
        "start": "node app.js"
        },
   
3. Make sure MongoDB server is listening
4. Run ```npm start```

#####You are ready to rock!

#Available endpoints

Address on which the gate takes calls: ```localhost:8080```
- (```This can be modified inside /config/gateway.config.json```)

1. ##### Send a message to a specific channel  
    ```/message?channel={slackchannel}&message={message}&attachment={attachment}``` 
    * 'slackchannel' must be the name of a channel to send a message to.
    * 'message' must be a text - it will automatically URL-encoded.
    * 'attachment' is optional and must be A JSON-based array of structured attachments.

2. ##### Send a message to all channels linked to a business ID
    ```/message/{id}?message={message}&attachment={attachment}```
     * 'id' must be a valid business ID.
     * 'message' must be a text - it will automatically URL-encoded.
     * 'attachment' is optional and must be A JSON-based array of structured attachments.

3. ##### Map a new channel to an existing business
    ```/channel/{id}?channel={slackchannel}```
    * 'id' must be a valid business ID.
    * 'slackchannel' must be the name of a channel to be linked with the business ID.
    