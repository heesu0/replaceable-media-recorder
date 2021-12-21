'use strict'

export default function FakeStreamFactory() {

  const DEFAULT_IMAGE = "https://choi-heesu.github.io/public/resource/image/src_resource_svg_Profile_empty_quit.svg";
  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d');
  let isStopDrawingFrames = false;

  this.getFakeVideoTrack = (option) => {
    option = option || {
      videoType: 'black' || 'noise' || 'image'
    }
    isStopDrawingFrames = false;
    let videoTrack;

    if (option.videoType === 'black') {
      videoTrack = createBlackVideoTrack();
    } else if (option.videoType === 'noise') {
      videoTrack = createWhiteNoiseVideoTrack();
    } else if (option.videoType === "image") {
      videoTrack = createImageVideoTrack();
    } else {
      videoTrack = createBlackVideoTrack();
    }

    return videoTrack;
  }

  this.releaseFakeStream = () => {
    isStopDrawingFrames = true;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.stream) {
      canvas.stream.getTracks().forEach(track => track.stop());
      canvas.stream = null;
    }
  }

  function createBlackVideoTrack(width = 640, height = 480) {
    canvas.width = width;
    canvas.height = height;

    function drawImage() {
      if (isStopDrawingFrames) {
        return;
      }
      context.fillRect(0, 0, width, height);
      setTimeout(() => {
        drawImage();
      }, 33);
    }
    drawImage();

    const stream = canvas.captureStream(25);
    canvas.stream = stream;

    return stream.getVideoTracks()[0];
  }

  function createWhiteNoiseVideoTrack(width = 160, height = 120) {
    canvas.width = width;
    canvas.height = height;
    context.fillRect(0, 0, width, height);
    const p = context.getImageData(0, 0, width, height);

    function drawImage() {
      if (isStopDrawingFrames) {
        return;
      }
      for (let i = 0; i < p.data.length; i++) {
        p.data[i++] = p.data[i++] = p.data[i++] = Math.random() * 255;
      }
      context.putImageData(p, 0, 0);
      setTimeout(() => {
        drawImage();
      }, 33);
    }
    drawImage();

    const stream = canvas.captureStream(25);
    canvas.stream = stream;

    return stream.getVideoTracks()[0];
  }

  function createImageVideoTrack(width = 640, height = 480) {
    canvas.width = width;
    canvas.height = height;
    const image = document.createElement('img');
    image.src = DEFAULT_IMAGE;

    function drawImage() {
      if (isStopDrawingFrames) {
        return;
      }
      context.drawImage(image, 0, 0, width, height);
      setTimeout(() => {
        drawImage();
      }, 33);
    }
    drawImage();

    const stream = canvas.captureStream(25);
    canvas.stream = stream;

    return stream.getVideoTracks()[0];
  }
}