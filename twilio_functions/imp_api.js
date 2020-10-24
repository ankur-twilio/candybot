/**
 *
 * Imp_api.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * This Function is called by our Studio flow to determin
 * whether the texter should get a trick or a treat. Based
 * on the decision, we return the URL for the Imp-activation.
 *
 */

exports.handler = async function(context, event, callback) {
  let imp_id = context.IMP_AGENT_ID;  
  let trick_treat = (Math.random() >= .8) ? 'treat' : 'trick';
  let url = "https://agent.electricimp.com/" + imp_id + "?var=" + trick_treat; 
  return callback(null, url);
}
