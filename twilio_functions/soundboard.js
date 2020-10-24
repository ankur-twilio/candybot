/**
 *
 * Soundboard.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This is my favorite function of the project. The Operator
 * Dashboard calls this function to dispense candy and
 * play our spooky sounds to the user. 
 *
 */

const axios = require('axios');

exports.handler = async function(context, event, callback) {
  const client = context.getTwilioClient();
  const binSID = context.ANNOUNCEMENTS_BIN_SID;
  const response = new Twilio.Response(); // Need this so we can call this from our soundboard.
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'POST');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader("Content-Type", "application/json");

  let task = event.task;
      
  getInProgressConference().then(async function(conferences) {
    if (!conferences.length) {
      return handleError('No In-Progress Conferences Found');
    }
    let conferenceSid = conferences[0].sid;
    let bin = 'https://handler.twilio.com/twiml/'+binSID+'?file='+task;
    await client.conferences(conferenceSid).update({announceUrl: bin}).catch((error) => handleError(error));
    
    if (event.treat) {
      console.log(event.treat)
      await axios.get('https://agent.electricimp.com/' + context.IMP_AGENT_ID + '?var=treat').catch((error) => handleError(error));
    }

  response.setBody({conference: conferenceSid});
  callback(null, response);
  
  });
  
  async function getInProgressConference() {
    if (event.conference) {
      return [{sid:event.conference}];
    }
    return client.conferences.list({
      friendlyName: context.CONFERENCE_ROOM_NAME,
      status: 'in-progress'
    }).catch((error) => handleError(error));
  }
  
  function handleError(error) {
    console.log(error);
    response.setBody({error:error})
    return callback(null, response);
  }
};
