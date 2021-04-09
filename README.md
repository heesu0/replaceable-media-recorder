replaceable-media-recorder
=============



`replaceable-media-recorder` is a [MediaRecorder API](https://w3c.github.io/mediacapture-record/#mediarecorder-api) Library written in JavaScript for add, remove and replace tracks during recording.

With `replace-media-recorder`
1. Audio tracks can be added, removed and replaced during recording.
2. Video tracks can be replaced during recording.



Demo
-------------



1.Description
-------------


### 1.1 Problems

We have some problems for recording with [MediaRecorder API](https://w3c.github.io/mediacapture-record/#mediarecorder-api).

1. MediaRecorder cannot record multiple MediaStreams. (video and audio track can only be recorded one by one)
2. MediaRecorder stops recording when tracks are added, removed or replaced during recording.

Let's talk about how to solve this problems separately by audio and video.


### 1.2 Audio Recording

We have two constraints recording audio.

1. MediaRecorder can record only one audio track.
2. MediaRecorder cannot add, remove or replace audio tracks during recording.

__We can use the [Web Audio API](https://www.w3.org/TR/webaudio/) to solve this problem.__

Using the Web Audio API
1. We can mix multiple audio tracks and make them into one audio track.
2. We can change the audio source without replacing the audio track inserted in the media recorder.

![image](https://user-images.githubusercontent.com/34677157/114151707-5bb9b100-9958-11eb-995e-a5231646e4e7.png)

The reason for adding a null source node is to allow recording of silent data even if the Destination Node and other Source Nodes are disconnected.

### 1.3 Video Recording

We have two constraints recording audio.

1. ~~MediaRecorder can record only one video track.~~ __(Video mixing is not a current consideration)__
2. MediaRecorder cannot replace audio tracks during recording.

There are two ways to change the video source without replacing the video track inserted in the MediaRecorder.

1. Replace video track indirectly using Canvas Element.
2. Replace video track indirectly using RTCRtpSender.

Both are available, but for RTCRtpSender, it seemed inefficient to have Local PeerConnection and go through encoding and decoding media data internally to replace video tracks.

__So we can use [Canvas Element](https://www.w3.org/html/wg/spec/the-canvas-element.html) to solve this problem.__

![image](https://user-images.githubusercontent.com/34677157/114161696-5746c580-9963-11eb-9a46-9eead362b967.png)

We call a Timer function in a background thread using the [Web Worker API](https://www.w3.org/TR/workers/) to update Canvas.   
(Because of background tab issues in Chrome : https://developers.google.com/web/updates/2017/03/background_tabs)



API
-------------

### WebRecorder

```js
const webRecorder = new WebRecorder();
```

### Methods


#### `WebRecorder.start(stream? : MediaStream) : Promise<void>`
- Start recording

```js
try {
  await webRecorder.start();
} catch (error) {
  console.log(error);
}

or

try {
  await webRecorder.start(stream);
} catch (error) {
  console.log(error);
}

or

webRecorder.start()
.then(function () {
  // do something
})
.catch(function (error) {
  console.log(error);
});

or

webRecorder.start(stream)
.then(function () {
  // do something
})
.catch(function (error) {
  console.log(error);
});

```


#### `WebRecorder.getRecordedStream() : MediaStream`
- Get recorded MediaStream while recording

```js
try {
  await webRecorder.start();
  video.srcObject = webRecorder.getRecordedStream();
} catch (error) {
  console.log(error);
}

or

webRecorder.start()
.then(function () {
  video.srcObject = webRecorder.getRecordedStream();
})
.catch(function (error) {
  console.log(error);
});
```


#### `WebRecorder.addAudioTrack(audioTrack : MediaStreamTrack) : void`
- Add audio track while recording

```js
webRecorder.addAudioTrack(stream.getAudioTracks()[0]);

or 

webRecorder.addAudioTrack(audioTrack);
```


#### `WebRecorder.deleteAudioTrack(audioTrack : MediaStreamTrack) : void`
- Delete audio track while recording

```js
webRecorder.deleteAudioTrack(stream.getAudioTracks()[0]);

or

webRecorder.deleteAduioTrack(audioTrack);
```


#### `WebRecorder.replaceVideoTrack(videoTrack : MediaStreamTrack) : void`
- Replace video track while recording

```js
webRecorder.replaceVideoTrack(stream.getVideoTracks()[0]);

or

webRecorder.replaceVideoTrack(videoTrack);
```


#### `WebRecorder.replaceStream(stream : MediaStream) : void`
- Replace MediaStream while recording

```js
webRecorder.replaceStream(stream);
```


#### `WebRecorder.stop() : void`
- Stop recording

```js
webRecorder.stop();
```


#### `WebRecorder.getRecordedBlob() : Blob`
- Get recorded BLOB

```js
const blob = webRecorder.getRecordedBlob();
```


#### `WebRecorder.download(fileName? : string) : void`
- Download recorded File

```js
webRecorder.download('example.webm');

or

webRecorder.download();
```
