'use strict'

export default function CanvasStreamProxy() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const video = document.createElement('video');
  const webWorker = new Worker('./public/js/CanvasWorker.js');
  let isCanvasUpdating = false;

  this.createCanvasStream = (stream) => {
    if (isCanvasUpdating) {
      console.error('Already drawing frames');
      return;
    }

    if (!(stream instanceof MediaStream)) {
      console.error('Invalid arugment');
      return;
    }

    if (!stream.getTracks().filter(function (t) {
      return t.kind === 'video';
    }).length) {
      console.error('Video track is missing');
      return;
    }

    isCanvasUpdating = true;
    setVideoElement(stream);
    const videoTrack = getCanvasStreamTrack();

    return videoTrack;
  }

  this.replaceVideoStream = (stream) => {
    if (!isCanvasUpdating) {
      console.error('Currently stop drawing frames');
      return;
    }

    if (!(stream instanceof MediaStream)) {
      console.error('Invalid arugment');
      return;
    }

    if (!stream.getTracks().filter(function (t) {
      return t.kind === 'video';
    }).length) {
      console.error('Video track is missing');
      return;
    }

    setVideoElement(stream);
  }

  this.releaseCanvasStream = () => {
    webWorker.postMessage('end');
    isCanvasUpdating = false;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.stream) {
      canvas.stream.getTracks().forEach(track => track.stop());
      canvas.stream = null;
    }

    video.pause();
    video.srcObject.getTracks().forEach((track) => track.stop());
    console.log(video.srcObject.getTracks());
  }


  function setVideoElement(stream) {
    video.srcObject = stream;

    video.muted = true;
    video.volume = 0;

    video.width = stream.getVideoTracks()[0].getSettings().width;
    video.height = stream.getVideoTracks()[0].getSettings().height;

    video.play();

    canvas.width = video.width;
    canvas.height = video.height;
  }

  function getCanvasStreamTrack() {
    function drawImage() {
      if (!isCanvasUpdating) {
        return;
      }
      context.drawImage(video, 0, 0, video.width, video.height);
      /*setTimeout(() => {
        drawImage();
      }, 33);*/
    }

    webWorker.postMessage('start');
    webWorker.onmessage = (event) => {
      drawImage();
    };

    //drawImage();
    const stream = canvas.captureStream(25);
    canvas.stream = stream;

    return stream.getVideoTracks()[0];
  }
}