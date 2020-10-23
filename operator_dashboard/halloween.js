/**
 *
 * Halloween.js
 * Twilio 2020 – Internal SE Hackathon
 * 
 * If you are reading this, welcome. These ~100 lines
 * control the candy operator dashboard. We make use of
 * Twilio Voice Client and Twilio Sync Client. Enjoy!
 *
 */


$(document).ready(function () {
  let syncClient;
  let voiceDevice;
  const syncTokenUrl = 'https://eoc-2020-9477.twil.io/sync_token'; //Change This
  const voiceTokenUrl = 'https://eoc-2020-9477.twil.io/voice_client_token'; //Change This
  const syncListName = 'halloween_items'; //You don't need to change this.

  /*----------  Start Helper Functions  ----------*/
  
  function getSyncClientToken(callback) {
    $.getJSON(syncTokenUrl)
    .then(function (data) {
      callback(data.token);
    });
  }

  function getVoiceClientToken(callback) {
    $.getJSON(voiceTokenUrl)
    .then(function (data) {
      callback(data.token);
    });
  }

  function addSyncItem(item) {
    syncClient.list(syncListName).then(function(list) {
      list.push({
        task: item,
      }).then(function(item) {
        console.log('Added: ', item.index);
      }).catch(function(err) {
        console.error(err);
      });
    });
  }
  
  function startSync(token) {
    syncClient = new Twilio.Sync.Client(token);

    // Sync Tokens expire every 15 minutes max. So, we
    // need to re-get a token before that happens.

    syncClient.on('tokenAboutToExpire', function() {
      var token = getSyncToken(function(token) {
        syncClient.updateToken(token);
      });
    });
  }

  /*----------  End Helper Functions  ----------*/

  /*----------  Start Realtime Services  ----------*/
  
  getSyncClientToken(function(token) {
    startSync(token);
  });


  getVoiceClientToken(function(token) {
    voiceDevice = new Twilio.Device(token);
    voiceDevice.on("connect", function(connection) {

      // This is a nice to have. We use the remote MediaStream
      // to show a visualization to the operator. Spooky!

      let stream = connection.getRemoteStream();
      visualize(stream);
    });
  });

  /*----------  Register Button Handlers  ----------*/
  
  $('.action-button').on('click', function() {

    // We add a "task" to the Sync List. We have webhooks for
    // this Sync Service pointed to a Twilio Function. That
    // function will in turn play the "task" announcement.

    let task = $(this).data('task-name');
    addSyncItem(task);

    this.blur(); // Cosmetic
  });

  $('#button-call').on('click', function() {
    if (voiceDevice) {

      // All we need to do is connect because the TwiML App for this
      // client identity puts the client directly into a conference
      // room where our PSTN call will be waiting :)

      var outgoingConnection = voiceDevice.connect();
    }
  });
});

/**
 *
 * Audio Visualizer Code from https://codepen.io/nfj525/pen/rVBaab
 *
 */

const canvas = document.querySelector('.visualizer');
const canvasCtx = canvas.getContext("2d");
let audioCtx;

function visualize(stream) {
  if(!audioCtx) {
    audioCtx = new AudioContext();
  }

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  //analyser.connect(audioCtx.destination);

  draw()

  function draw() {
    const WIDTH = canvas.width
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

    canvasCtx.beginPath();

    let sliceWidth = WIDTH * 1.0 / bufferLength;
    let x = 0;


    for(let i = 0; i < bufferLength; i++) {

      let v = dataArray[i] / 128.0;
      let y = v * HEIGHT/2;

      if(i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
  }
}