/**
 *
 * Sync_webhook_handler.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This is my favorite function of the project.
 * Everytime Sync gets a new list item, it makes a webhook
 * to this function which in turn gets the latest stored
 * Conference SID and plays a music file to that. 
 *
 */

 const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const syncServiceSid = context.SYNC_SID;
  const syncDocumentName = context.SYNC_DOC;
  const binSID = context.ANNOUNCEMENTS_BIN_SID;
  let data = JSON.parse(event.ItemData);
	    
  readDocument().then(async function(doc) {
    let conferenceSid = doc.data.conferenceSid;
    let bin = 'https://handler.twilio.com/twiml/'+binSID+'?file='+data.task;
    await client.conferences(conferenceSid).update({announceUrl: bin}).catch((error) => handleError(error));
    
    if (data.task == 'treat_1') {
      await axios.get('https://agent.electricimp.com/' + context.IMP_ID + '?var=treat').catch((error) => handleError(error));
    }
    callback();
  });
  
  function handleError(error) {
    console.log(error);
    callback(error);
  }
  
  function readDocument() {
    return client.sync
    .services(syncServiceSid)
    .documents(syncDocumentName)
    .fetch()
    .catch((error) => handleError(error));;
  }
};
