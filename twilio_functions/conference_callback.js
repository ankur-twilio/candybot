/**
 *
 * Conference_callback.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is called any time someone joins our Halloween
 * Conference. We need to store the Conference SID for when
 * we asynchronously play an Announcement. 
 *
 */

exports.handler = function(context, event, callback) {
  const client = context.getTwilioClient();
  const syncDocumentName = context.SYNC_DOC;
  const syncServiceSid = context.SYNC_SID;
  
  let conferenceSid = event.ConferenceSid;

  updateDocument(conferenceSid)
    .then(() => callback());
  
   async function updateDocument(conferenceSid) {
      await client.sync
      .services(syncServiceSid)
      .documents(syncDocumentName)
      .update({
        data: {
          conferenceSid: conferenceSid,
        },
      })
      .catch((error) => {
        console.log(error);
        return callback(error);
      });
  }
};
