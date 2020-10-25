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
  let conferenceSid;
  let stream;

  //!!!!!Change the line below!!!!!
  const voiceTokenUrl = 'https://eoc-2020-9477.twil.io/voice_client_token'; //Change This

  //!!!!!Change the line below!!!!!
  const soundboardTaskUrl = 'https://eoc-2020-9477.twil.io/soundboard'; //Change This

  //(Advanced) IBM Watson Auto-Treat Detection
  //!!!!!Change the line below!!!!!
  const syncTokenUrl = 'https://eoc-2020-9477.twil.io/sync_token'; //Change This
  const syncList = 'halloween_items'; // No need to change
  const autoTreatTask = 'dispensing'; // No need to change
  const autoGreetingsTask = 'greetings';// No need to change

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

  function postSoundboardTask(task, treat = null) {
    $.post(soundboardTaskUrl, {
      task: task, 
      treat: treat,
      conference: conferenceSid
    })
    .then(function (data) {
      console.log(data);
      if (data.error) {
        alert(data.error);
      }
      if (data.conference) {
        conferenceSid = data.conference;
      }
    });
  }

  async function autoTreatAlert() {
    postSoundboardTask(autoGreetingsTask, true);
    const response = await Swal.fire({
      title: 'Trick-or-Treat Auto-Detected!!',
      html: 'Auto-release in <strong></strong> seconds.<br/><br/>',
      timer: 4000,
      showCancelButton: true,
      willOpen: () => {
        const content = Swal.getContent()
        const $ = content.querySelector.bind(content)

        Swal.showLoading()

        timerInterval = setInterval(() => {
          Swal.getContent().querySelector('strong')
            .textContent = (Swal.getTimerLeft() / 1000)
              .toFixed(0)
        }, 100)
      },
      willClose: () => {
        clearInterval(timerInterval)
      }
    })

    if (response.dismiss != "cancel") {
      return autoTreat()
    }
  }

  function autoTreat() {
    return postSoundboardTask(autoTreatTask, true);
  }

  function startSync(token) {
    console.log('Starting sync...');
    syncClient = new Twilio.Sync.Client(token);

    // Sync Tokens expire every 15 minutes max. So, we
    // need to re-get a token before that happens.

    syncClient.on('tokenAboutToExpire', function() {
      var token = getSyncToken(function(token) {
        syncClient.updateToken(token);
      });
    });

    syncClient.list(syncList).then(function(list) {
      list.on('itemAdded', function(result) {
        autoTreatAlert();
      });
    });
  }
  
  /*----------  End Helper Functions  ----------*/

  /*----------  Start Realtime Sync  ----------*/


  if (location.origin !== "file://") { // Sync can not work when used here. 
    getSyncClientToken(function(token) {
      startSync(token);
    });
  }

  /*----------  Register Button Handlers  ----------*/
  
  $('.action-button').on('click', function() {

    // We add a "task" to the Sync List. We have webhooks for
    // this Sync Service pointed to a Twilio Function. That
    // function will in turn play the "task" announcement.

    let task = $(this).data('task-name');
    let treat = ($(this).data('treat')) ? true : null;
    console.log(treat);
    postSoundboardTask(task, treat);

    this.blur(); // Cosmetic
  });

  $('#button-call').on('click', function() {
    getVoiceClientToken(function(token) {
      voiceDevice = new Twilio.Device(token);
      voiceDevice.on("ready", function(device) {
        device.connect();
      });
      voiceDevice.on("connect", function(connection) {
        connection.mute(true);
        connection.on("volume", function() {
          if (stream == null) {
            stream = connection.getRemoteStream();
            visualize(stream);
          }
        }); // End on('volume')
      }); // End on('connect')
      $('#button-call').hide();
    }); // End getVoiceClientToken
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
    audioCtx = new (window["AudioContext"] || window["webkitAudioContext"])();
  }
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  // analyser.connect(audioCtx.destination);

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