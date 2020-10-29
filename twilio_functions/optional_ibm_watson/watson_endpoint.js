/**
 *
 * Watson_endpoint.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is called by our websocket server
 * if IBM Watson detects a trick-or-treat!
 *
 */

exports.handler = function(context, event, callback) {
  const client = context.getTwilioClient();
  
  let syncServiceSid = context.SYNC_SID;
  let syncListName = context.SYNC_LIST_NAME;

  updateList()
    .then(() => callback())
    .catch((error) => callback(error));
  
   async function updateList() {
    try {
      await client.sync
      .services(syncServiceSid)
      .syncLists(syncListName)
      .syncListItems
      .create({
        data: {
          'tt_updated': true,
        },
        ttl: 3600
      });      
    } catch(err) {
      if (err.code == 20404) {
        await createList();
        updateList().then(callback());
      }
      callback(err.status);
    }
  }
  
   async function createList() {
      await client.sync
      .services(syncServiceSid)
      .syncLists
      .create({
        uniqueName: syncListName
      });
   }
};
