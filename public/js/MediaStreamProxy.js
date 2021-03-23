'use strict'

export default function MediaStreamProxy() {

  const offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };;

  let pc1;
  let pc2;
  let localStream;
  let remoteStream;
  let videoSender;
  let audioSender;
  let mediaStreamTrackPromise;

  this.connectLocalConnection = async (stream) => {
    if (!(stream instanceof MediaStream)) {
      return Promise.reject(new Error('Invalid arugment'));
    }

    try {
      await createLocalConnection(stream);
    } catch (error) {
      console.log('Local Connection Fail');
      return Promise.reject(error);
    }

    try {
      remoteStream = await mediaStreamTrackPromise;
    } catch (error) {
      console.log('Rtp Receiver Error');
      return Promise.reject(error);
    }

    return Promise.resolve(remoteStream);
  }

  async function createLocalConnection(stream) {
    localStream = stream;

    const configuration = {};
    pc1 = new RTCPeerConnection(configuration);
    pc1.addEventListener('icecandidate', e => onIceCandidate(pc1, e));
    pc2 = new RTCPeerConnection(configuration);
    pc2.addEventListener('icecandiate', e => onIceCandidate(pc2, e));
    pc1.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc1, e));
    pc2.addEventListener('iceconnectionstatechange', e => onIceStateChange(pc2, e));

    mediaStreamTrackPromise = new Promise((resolve) => {
      pc2.addEventListener('track', (event) => {
        if (remoteStream !== event.streams[0]) {
          // remoteStream = event.streams[0];
          // resolve();
          resolve(event.streams[0]);
        }
      });
    });

    // Right now, only use video track
    localStream.getTracks().forEach((track) => {
      if (track.kind == "video") {
        videoSender = pc1.addTrack(track, localStream)
      }
      /*if (track.kind == "audio") {
        audioSender = pc1.addTrack(track, localStream)
      }*/
    });

    try {
      console.log('pc1 createOffer start');
      const offer = await pc1.createOffer(offerOptions);
      await onCreateOfferSuccess(offer);
    } catch (error) {
      onCreateSessionDescriptionError(error);
      return Promise.reject(error);
    }
  }

  function onCreateSessionDescriptionError(error) {
    console.log(`Failed to create session description: ${error.toString()}`);
  }

  async function onCreateOfferSuccess(desc) {
    console.log(`Offer from pc1\n${desc.sdp}`);
    console.log('pc1 setLocalDescription start');
    try {
      await pc1.setLocalDescription(desc);
      onSetLocalSuccess(pc1);
    } catch (error) {
      onSetSessionDescriptionError();
      return Promise.reject(error);
    }

    console.log('pc2 setRemoteDescription start');
    try {
      await pc2.setRemoteDescription(desc);
      onSetRemoteSuccess(pc2);
    } catch (error) {
      onSetSessionDescriptionError();
      return Promise.reject(error);
    }

    console.log('pc2 createAnswer start');
    try {
      const answer = await pc2.createAnswer();
      await onCreateAnswerSuccess(answer);
    } catch (error) {
      onCreateSessionDescriptionError(error);
      return Promise.reject(error);
    }
  }

  function onSetLocalSuccess(pc) {
    console.log(`${getName(pc)} setLocalDescription complete`);
  }

  function onSetRemoteSuccess(pc) {
    console.log(`${getName(pc)} setRemoteDescription complete`);
  }

  function onSetSessionDescriptionError(error) {
    console.log(`Failed to set session description: ${error.toString()}`);
  }

  async function onCreateAnswerSuccess(desc) {
    console.log(`Answer from pc2:\n${desc.sdp}`);
    console.log('pc2 setLocalDescription start');
    try {
      await pc2.setLocalDescription(desc);
      onSetLocalSuccess(pc2);
    } catch (error) {
      onSetSessionDescriptionError(error);
      return Promise.reject(error);
    }
    console.log('pc1 setRemoteDescription start');
    try {
      await pc1.setRemoteDescription(desc);
      onSetRemoteSuccess(pc1);
    } catch (error) {
      onSetSessionDescriptionError(error);
      return Promise.reject(error);
    }
  }

  async function onIceCandidate(pc, event) {
    try {
      await (getOtherPc(pc).addIceCandidate(event.candidate));
      onAddIceCandidateSuccess(pc);
    } catch (error) {
      onAddIceCandidateError(pc, error);
      return Promise.reject(error);
    }
    console.log(`${getName(pc)} ICE candidate:\n${event.candidate ? event.candidate.candidate : '(null)'}`);
  }

  function onAddIceCandidateSuccess(pc) {
    console.log(`${getName(pc)} addIceCandidate success`);
  }

  function onAddIceCandidateError(pc, error) {
    console.log(`${getName(pc)} failed to add ICE Candidate: ${error.toString()}`);
  }

  function onIceStateChange(pc, event) {
    if (pc) {
      console.log(`${getName(pc)} ICE state: ${pc.iceConnectionState}`);
      console.log('ICE state change event: ', event);
    }
  }

  function getName(pc) {
    return (pc === pc1) ? 'pc1' : 'pc2';
  }

  function getOtherPc(pc) {
    return (pc === pc1) ? pc2 : pc1;
  }

  /*this.getMediaStream = () => {
    return remoteStream;
  }*/

  this.replaceVideoTrack = (track) => {
    videoSender.replaceTrack(track);
  }

  this.replaceAudioTrack = (track) => {
    audioSender.replaceTrack(track);
  }

  this.disconnectLocalConnection = () => {
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    pc1.close();
    pc2.close();

    // clear variable
    pc1 = null;
    pc2 = null;
    localStream = null;
    remoteStream = null;
    videoSender = null;
    audioSender = null;
    mediaStreamTrackPromise = null;
  }
}