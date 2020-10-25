/**
 *
 * Voice_Twiml.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is what your Twiml App and operator
 * point to when a call is initiated.
 *
 */
 exports.handler = function(context, event, callback) {
  let twiml = new Twilio.twiml.VoiceResponse();
  if (event.phone && context.MEDIA_STREAM_URL) {  
    const start = twiml.start();
    start.stream({
        name: 'Detection Stream',
        url: context.MEDIA_STREAM_URL
    });
  }

  const dial = twiml.dial();
  dial.conference(context.CONFERENCE_ROOM_NAME);
  callback(null, twiml);
};
