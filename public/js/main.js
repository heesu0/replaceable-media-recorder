'use strict';

import WebRecorder from './WebRecorder.js'
import FakeStreamFactory from './FakeStreamFactory.js'

const localVideo = document.getElementById("localVideo");
const firstAudio = document.getElementById('firstAudio');
const secondAudio = document.getElementById('secondAudio');
const thirdAudio = document.getElementById('thirdAudio');

const micAudioButton = document.getElementById('micAudioButton');
const firstAudioButton = document.getElementById('firstAudioButton');
const secondAudioButton = document.getElementById('secondAudioButton');
const thirdAudioButton = document.getElementById('thirdAudioButton');

const camVideoButton = document.getElementById('camVideoButton');
const screenVideoButton = document.getElementById('screenVideoButton');
const sampleVideoButton = document.getElementById('sampleVideoButton');
const noiseVideoButton = document.getElementById('noiseVideoButton');

const recordStartButton = document.getElementById('recordStartButton');
const recordStopButton = document.getElementById('recordStopButton');
const downloadButton = document.getElementById('downloadButton');
const playButton = document.getElementById('playButton');

micAudioButton.addEventListener('click', toggleMicAudio);
firstAudioButton.addEventListener('click', toggleFirstAudio);
secondAudioButton.addEventListener('click', toggleSecondAudio);
thirdAudioButton.addEventListener('click', toggleThirdAudio);

camVideoButton.addEventListener('click', replaceCamVideo);
screenVideoButton.addEventListener('click', replaceScreenVideo);
sampleVideoButton.addEventListener('click', replacesampleVideo);
noiseVideoButton.addEventListener('click', replaceNoiseVideo);

recordStartButton.addEventListener('click', startRecording);
recordStopButton.addEventListener('click', stopRecording);
playButton.addEventListener('click', play);
downloadButton.addEventListener('click', download);

disableSourceButtons();
enableRecordButtons();

const webRecorder = new WebRecorder();
const recordVideo = document.getElementById('recordVideo');
const remoteVideo = document.getElementById('remoteVideo');

let micAudioStream;
let firstAudioStream;
let secondAudioStream;
let thirdAudioStream;

let camVideoStream;
let screenVideoStream;
let sampleVideoStream;
let noiseVideoTrack;

/****************************************************
  Audio Part
****************************************************/

async function toggleMicAudio() {
  if (micAudioButton.textContent === 'Audio MIC OFF') {
    micAudioButton.style.background = 'red';
    micAudioButton.textContent = 'Audio MIC ON';
    if (!micAudioStream) {
      micAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
    webRecorder.addAudioTrack(micAudioStream.getAudioTracks()[0]);
  } else if (micAudioButton.textContent === 'Audio MIC ON') {
    micAudioButton.style.background = '';
    micAudioButton.textContent = 'Audio MIC OFF';

    if (micAudioStream) {
      webRecorder.deleteAudioTrack(micAudioStream.getAudioTracks()[0]);
    }
  }
}

function toggleFirstAudio() {
  if (firstAudioButton.textContent === 'Audio #1 OFF') {
    firstAudioButton.style.background = 'red';
    firstAudioButton.textContent = 'Audio #1 ON';
    firstAudio.play();
    if (!firstAudioStream) {
      firstAudioStream = firstAudio.captureStream();
    }
    webRecorder.addAudioTrack(firstAudioStream.getAudioTracks()[0]);
  } else if (firstAudioButton.textContent === 'Audio #1 ON') {
    firstAudioButton.style.background = '';
    firstAudioButton.textContent = 'Audio #1 OFF';
    firstAudio.pause();
    if (firstAudioStream) {
      webRecorder.deleteAudioTrack(firstAudioStream.getAudioTracks()[0]);
    }
  }
}

function toggleSecondAudio() {
  if (secondAudioButton.textContent === 'Audio #2 OFF') {
    secondAudioButton.style.background = 'red';
    secondAudioButton.textContent = 'Audio #2 ON';
    secondAudio.play();
    if (!secondAudioStream) {
      secondAudioStream = secondAudio.captureStream();
    }
    webRecorder.addAudioTrack(secondAudioStream.getAudioTracks()[0]);
  } else if (secondAudioButton.textContent === 'Audio #2 ON') {
    secondAudioButton.style.background = '';
    secondAudioButton.textContent = 'Audio #2 OFF';
    secondAudio.pause();
    if (secondAudioStream) {
      webRecorder.deleteAudioTrack(secondAudioStream.getAudioTracks()[0]);
    }
  }
}

function toggleThirdAudio() {
  if (thirdAudioButton.textContent === 'Audio #3 OFF') {
    thirdAudioButton.style.background = 'red';
    thirdAudioButton.textContent = 'Audio #3 ON';
    thirdAudio.play();
    if (!thirdAudioStream) {
      thirdAudioStream = thirdAudio.captureStream();
    }
    webRecorder.addAudioTrack(thirdAudioStream.getAudioTracks()[0]);
  } else if (thirdAudioButton.textContent === 'Audio #3 ON') {
    thirdAudioButton.style.background = '';
    thirdAudioButton.textContent = 'Audio #3 OFF';
    thirdAudio.pause();
    if (thirdAudioStream) {
      webRecorder.deleteAudioTrack(thirdAudioStream.getAudioTracks()[0]);
    }
  }
}

/****************************************************
  Video Part
****************************************************/

async function replaceCamVideo() {
  disableVideoBackground();
  camVideoButton.style.background = 'blue';

  if (camVideoStream) {
    webRecorder.replaceVideoTrack(camVideoStream.getVideoTracks()[0]);
    return;
  }

  camVideoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
  //webRecorder.replaceStream(camVideoStream);
  webRecorder.replaceVideoTrack(camVideoStream.getVideoTracks()[0]);
}

async function replaceScreenVideo() {
  disableVideoBackground();
  screenVideoButton.style.background = 'blue';

  screenVideoStream = await navigator.mediaDevices.getDisplayMedia({ audio: false, video: true });
  screenVideoStream.getVideoTracks()[0].onended = () => {
    screenVideoStream = null;
  };
  webRecorder.replaceVideoTrack(screenVideoStream.getVideoTracks()[0]);
}

async function replacesampleVideo() {
  disableVideoBackground();
  sampleVideoButton.style.background = 'blue';

  if (sampleVideoStream) {
    webRecorder.replaceVideoTrack(sampleVideoStream.getVideoTracks()[0]);
    return;
  }

  localVideo.play();
  sampleVideoStream = localVideo.captureStream();
  webRecorder.replaceVideoTrack(sampleVideoStream.getVideoTracks()[0]);
}

function replaceNoiseVideo() {
  disableVideoBackground();
  noiseVideoButton.style.background = 'blue';

  if (noiseVideoTrack) {
    webRecorder.replaceVideoTrack(noiseVideoTrack);
    return;
  }

  const fakeStreamFactory = new FakeStreamFactory();
  const option = {
    videoType: "noise"
  }
  
  noiseVideoTrack = fakeStreamFactory.getFakeVideoTrack(option);
  webRecorder.replaceVideoTrack(noiseVideoTrack);
}


/****************************************************
  Button Part
****************************************************/



function disableVideoBackground() {
  if (screenVideoStream) {
    screenVideoStream.getTracks().forEach((track) => track.stop());
    screenVideoStream = null;
  }
  camVideoButton.style.background = '';
  screenVideoButton.style.background = '';
  sampleVideoButton.style.background = '';
  noiseVideoButton.style.background = '';
}

function enableRecordButtons() {
  recordStartButton.disabled = false;
  recordStopButton.disabled = false;
  playButton.disabled = false;
  downloadButton.disabled = false;
}

function enableSourceButtons() {
  micAudioButton.disabled = false;
  firstAudioButton.disabled = false;
  secondAudioButton.disabled = false;
  thirdAudioButton.disabled = false;

  camVideoButton.disabled = false;
  screenVideoButton.disabled = false;
  sampleVideoButton.disabled = false;
  noiseVideoButton.disabled = false;
}

function disableRecordButtons() {
  recordStartButton.disabled = true;
  recordStopButton.disabled = true;
  playButton.disabled = true;
  downloadButton.disabled = true;
}

function disableSourceButtons() {
  micAudioButton.disabled = true;
  firstAudioButton.disabled = true;
  secondAudioButton.disabled = true;
  thirdAudioButton.disabled = true;

  camVideoButton.disabled = true;
  screenVideoButton.disabled = true;
  sampleVideoButton.disabled = true;
  noiseVideoButton.disabled = true;
}

function reset() {
  firstAudio.pause();
  secondAudio.pause();
  thirdAudio.pause();
  localVideo

  micAudioButton.style.background = '';
  firstAudioButton.style.background = '';
  secondAudioButton.style.background = '';
  thirdAudioButton.style.background = '';

  micAudioButton.textContent = 'Audio MIC OFF';
  firstAudioButton.textContent = 'Audio #1 OFF';
  secondAudioButton.textContent = 'Audio #2 OFF';
  thirdAudioButton.textContent = 'Audio #3 OFF';

  micAudioStream = null;
  firstAudioStream = null;
  secondAudioStream = null;
  thirdAudioStream = null;

  camVideoStream = null;
  screenVideoStream = null;
  sampleVideoStream = null;
  noiseVideoTrack = null;

  disableVideoBackground();
}

/****************************************************
  Record Part
****************************************************/

async function startRecording() {
  camVideoStream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });

  webRecorder.start(camVideoStream)
    .then(function () {
      remoteVideo.srcObject = webRecorder.getRecordedStream();
    })
    .catch(function (error) {
      console.log(error);
      return;
    });
    
  /*try {
    await webRecorder.start();
    remoteVideo.srcObject = webRecorder.getRecordedStream();
  } catch (error) {
    console.log(error);
    return;
  }*/

  recordStartButton.style.background = "red";
  recordStartButton.style.color = "black";
  enableSourceButtons();
}

function stopRecording() {
  webRecorder.stop();

  recordStartButton.style.background = "";
  recordStartButton.style.color = "";
  disableSourceButtons();
  reset();
}

function play() {
  const blob = webRecorder.getRecordedBlob();
  recordVideo.src = window.URL.createObjectURL(blob);
  recordVideo.controls = true;
}

function download() {
  webRecorder.download();
}
