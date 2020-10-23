/**
 *
 * Voice_token.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is generates a Voice Token for our
 * operator dashboard. In reality, you should have
 * auth mechanisms to set the IDENTITY. This is 
 * perfectly fine for Halloween :)
 *
 */

 exports.handler = function(context, event, callback) {
  // REMINDER: This identity is only for prototyping purposes
  const IDENTITY = "client_user";

  const ACCOUNT_SID = context.ACCOUNT_SID;

  // Here we set the TwiML App ID for this identity. This is key
  // for getting the client into the Conference automatically.

  const TWIML_APPLICATION_SID = context.TWIML_APPLICATION_SID;
  const API_KEY = context.API_KEY;
  const API_SECRET = context.API_SECRET;

  const AccessToken = Twilio.jwt.AccessToken;
  const VoiceGrant = AccessToken.VoiceGrant;

  const accessToken = new AccessToken(ACCOUNT_SID, API_KEY, API_SECRET);
  accessToken.identity = IDENTITY;
  const grant = new VoiceGrant({
    outgoingApplicationSid: TWIML_APPLICATION_SID,
    incomingAllow: true
  });
  accessToken.addGrant(grant);

  const response = new Twilio.Response();

  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');

  response.appendHeader("Content-Type", "application/json");
  response.setBody({
    identity: IDENTITY,
    token: accessToken.toJwt()
  });
  callback(null, response);
};
