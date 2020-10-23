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
  let imp_id = context.IMP_ID;
  let url = '';
  
  let trick_treat = Math.random() >= .8
  
  if (trick_treat == true) {   
  	url = "https://agent.electricimp.com/" + imp_id + "?var=treat";
  }
  else {
  	url = "https://agent.electricimp.com/" + imp_id + "?var=trick";
  }
    
  return callback(null, url);
}
