'use strict'

import CanvasStreamProxy from './CanvasStreamProxy.js';
import FakeStreamFactory from './FakeStreamFactory.js';
import MediaStreamProxy from './MediaStreamProxy.js';

export default function WebRecorder() {

  // Video Part
  const fakeStreamFactory = new FakeStreamFactory();
  const mediaStreamProxy = new MediaStreamProxy();
  const canvasStreamProxy = new CanvasStreamProxy();

  // Audio Part
  const sourceNodeMap = new Map();
  let audioContext = null;
  let audioDestination = null;
  // Connection problems if mutedSourceNode is a local variable
  let mutedSourceNode = null;

  // Recording Part
  let mediaRecorder = null;
  let supportedType = null;
  let targetStream = null;
  let isRecording = false;
  let recordedBlobList = [];

  this.start = startRecording;
  this.stop = stopRecording;
  this.download = downloadRecording;

  this.addAudioTrack = (track) => {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    if (!(track instanceof MediaStreamTrack)) {
      console.error('Invalid arugment');
      return;
    }

    if (track.kind === 'audio') {
      const trackID = track.id;
      if (sourceNodeMap.has(trackID)) {
        return;
      }

      const audioStream = new MediaStream();
      audioStream.addTrack(track);

      const sourceNode = audioContext.createMediaStreamSource(audioStream);
      sourceNode.connect(audioDestination);
      sourceNodeMap.set(trackID, sourceNode);
    }
  }

  this.deleteAudioTrack = (track) => {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    if (!(track instanceof MediaStreamTrack)) {
      console.error('Invalid arugment');
      return;
    }

    if (track.kind === 'audio') {
      const trackID = track.id;
      const sourceNode = sourceNodeMap.get(trackID);

      if (sourceNode) {
        sourceNode.disconnect();
        sourceNodeMap.delete(trackID);
      }
    }
  }

  this.replaceVideoTrack = (track) => {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    if (!(track instanceof MediaStreamTrack)) {
      console.error('Invalid arugment');
      return;
    }

    if (track.kind === 'video') {
      const stream = new MediaStream();
      stream.addTrack(track);
      canvasStreamProxy.replaceVideoStream(stream);
      //mediaStreamProxy.replaceVideoTrack(track);
    }
  }

  this.replaceStream = (stream) => {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    if (!(stream instanceof MediaStream)) {
      console.error('Invalid arugment');
      return;
    }

    clearAudioTrack();

    stream.getTracks().forEach((track) => {
      if (track.kind === 'video') {
        mediaStreamProxy.replaceVideoTrack(track);
      } else if (track.kind === 'audio') {
        const trackID = track.id;
        if (sourceNodeMap.has(trackID)) {
          return;
        }

        const audioStream = new MediaStream();
        audioStream.addTrack(track);

        const sourceNode = audioContext.createMediaStreamSource(audioStream);
        sourceNode.connect(audioDestination);
        sourceNodeMap.set(trackID, sourceNode);
      }
    });
  }

  this.getRecordedStream = () => {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    return targetStream;
  }

  this.getRecordedBlob = () => {
    if (!recordedBlobList.length) {
      console.error('There is no recorded data');
      return;
    }

    const blob = new Blob(recordedBlobList, { type: supportedType })

    return blob;
  }

  async function startRecording(stream) {
    const mimeTypes = [
      'video/webm; codecs="vp9, opus"',
      'video/webm; codecs="vp8, opus"',
      'video/webm; codecs=vp9',
      'video/webm; codecs=vp8',
      'video/webm; codecs=daala',
      'video/webm; codecs=h264',
      'video/webm;',
      'video/mpeg'
    ];

    for (let i in mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeTypes[i])) {
        supportedType = mimeTypes[i];
        break;
      }
    }

    if (!supportedType) {
      return Promise.reject('No supported type found for MediaRecorder');
    }

    let options = {
      mimeType: supportedType
    };

    try {
      targetStream = await createTargetStream(stream);
    } catch (error) {
      console.error(error);
      return Promise.reject('TargetStream Error');
    }

    // reset recorded data
    recordedBlobList = [];
    try {
      mediaRecorder = new MediaRecorder(targetStream, options);
    } catch (error) {
      console.error(error);
      return Promise.reject('MediaRecorder Error');
    }

    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    mediaRecorder.addEventListener('stop', handleStop);
    mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
    mediaRecorder.start(100); // collect 100ms of data blobs
    isRecording = true;
    console.log('MediaRecorder started', mediaRecorder);
  }

  function handleDataAvailable(event) {
    if (event.data && event.data.size > 0) {
      recordedBlobList.push(event.data);
    }
  }

  function handleStop(event) {
    console.log('Recorder stopped: ', event);
    isRecording = false;

    resetVideoProcess();
    resetAudioProcess();

    // reset recording part
    targetStream.getTracks().forEach(track => track.stop());
    targetStream = null;
    mediaRecorder = null;
    supportedType = null;
  }

  function stopRecording() {
    if (!isRecording) {
      console.error('Recording is not in progress');
      return;
    }

    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobList);
  }

  function downloadRecording(file_name) {
    if (!recordedBlobList.length) {
      console.error('There is no recorded data');
      return;
    }

    const name = file_name || 'test.webm';
    const blob = new Blob(recordedBlobList, { type: supportedType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  async function createTargetStream(stream) {
    stream = stream || new MediaStream();

    if (!(stream instanceof MediaStream)) {
      return Promise.reject(new Error('Invalid arugment'));
    }

    if (!stream.getTracks().filter((track) => {
      return track.kind === 'video';
    }).length) {
      const option = {
        videoType: 'black'
      };
      const fakeVideoTrack = fakeStreamFactory.getFakeVideoTrack(option);
      stream.addTrack(fakeVideoTrack);
    }

    /*let videoTrack;
    try {
      videoTrack = await processVideoTrack(stream);
    } catch (error) {
      return Promise.reject(error);
    }*/
    
    const videoTrack = canvasStreamProxy.createCanvasStream(stream);
    const audioTrack = processAudioTrack(stream);

    const resultStream = new MediaStream();
    resultStream.addTrack(videoTrack);
    resultStream.addTrack(audioTrack);

    return Promise.resolve(resultStream);
  }

  async function processVideoTrack(stream) {
    try {
      const proxyStream = await mediaStreamProxy.connectLocalConnection(stream);
      return Promise.resolve(proxyStream.getVideoTracks()[0]);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function processAudioTrack(stream) {
    audioContext = new AudioContext();
    audioDestination = audioContext.createMediaStreamDestination();

    // default AudioSourceNode
    mutedSourceNode = audioContext.createBufferSource();
    mutedSourceNode.connect(audioDestination);

    stream.getTracks().filter((track) => {
      return track.kind === 'audio';
    }).forEach(function (track) {
      const trackID = track.id;
      if (sourceNodeMap.has(trackID)) {
        return;
      }

      const audioStream = new MediaStream();
      audioStream.addTrack(track);

      const sourceNode = audioContext.createMediaStreamSource(audioStream);
      sourceNode.connect(audioDestination);
      sourceNodeMap.set(trackID, sourceNode);
    });

    return audioDestination.stream.getAudioTracks()[0];
  }

  function clearAudioTrack() {
    sourceNodeMap.forEach((sourceNode) => {
      sourceNode.disconnect();
    });
    sourceNodeMap.clear();
  }

  function resetVideoProcess() {
    fakeStreamFactory.releaseFakeStream();
    //mediaStreamProxy.disconnectLocalConnection();
    canvasStreamProxy.releaseCanvasStream();
  }

  function resetAudioProcess() {
    // reset sequence?
    sourceNodeMap.forEach((sourceNode) => {
      sourceNode.disconnect();
    });
    sourceNodeMap.clear();

    if (mutedSourceNode) {
      mutedSourceNode.disconnect();
      mutedSourceNode = null;
    }

    if (audioDestination) {
      audioDestination.disconnect();
      audioDestination = null;
    }

    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
  }
}