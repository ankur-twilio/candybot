/**
 *
 * Sync_token.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is generates a Sync Token for our
 * operator dashboard to know when IBM Watson
 * detects a trick-or-treat request!
 *
 */

exports.handler = function(context, event, callback) {  
  // make sure you enable ACCOUNT_SID and AUTH_TOKEN in Functions/Configuration
  const ACCOUNT_SID = context.ACCOUNT_SID;

  // set these values in your .env file
  const SERVICE_SID = context.SYNC_SID;
  const API_KEY = context.API_KEY;
  const API_SECRET = context.API_SECRET;
  
  const response = new Twilio.Response();
  
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  // REMINDER: This identity is only for prototyping purposes
  const IDENTITY = 'HalloweenController';

  const AccessToken = Twilio.jwt.AccessToken;
  const SyncGrant = AccessToken.SyncGrant;

  const syncGrant = new SyncGrant({
    serviceSid: SERVICE_SID
  });

  const accessToken = new AccessToken(
    ACCOUNT_SID,
    API_KEY,
    API_SECRET
  );

  accessToken.addGrant(syncGrant);
  accessToken.identity = IDENTITY;
  
  response.setBody({ token: accessToken.toJwt() });

  callback(null, response);
}
