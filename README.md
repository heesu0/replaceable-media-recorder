# replaceable-media-recorder


### WebRecorder

```js
const webRecorder = new WebRecorder();
```

### Methods

#### WebRecorder.start(stream? : MediaStream) : Promise<void>
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

#### WebRecorder.getRecordedStream() : MediaStream
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

#### WebRecorder.addAudioTrack(audioTrack : MediaStreamTrack) : void
- Add audio track while recording

```js
webRecorder.addAudioTrack(stream.getAudioTracks()[0]);

or 

webRecorder.addAudioTrack(audioTrack);
```

#### WebRecorder.deleteAudioTrack(audioTrack : MediaStreamTrack) : void
- Delete audio track while recording

```js
webRecorder.deleteAudioTrack(stream.getAudioTracks()[0]);

or

webRecorder.deleteAduioTrack(audioTrack);
```

#### WebRecorder.replaceVideoTrack(videoTrack : MediaStreamTrack) : void
- Replace video track while recording

```js
webRecorder.replaceVideoTrack(stream.getVideoTracks()[0]);

or

webRecorder.replaceVideoTrack(videoTrack);
```

#### WebRecorder.replaceStream(stream : MediaStream) : void
- Replace MediaStream while recording

```js
webRecorder.replaceStream(stream);
```

### WebRecorder.stop() : void
- Stop recording

```js
webRecorder.stop();
```

#### WebRecorder.getRecordedBlob() : Blob 
- Get recorded BLOB

```js
const blob = webRecorder.getRecordedBlob();
```

#### WebRecorder.download(fileName? : string) : void
- Download recorded File

```js
webRecorder.download('example.webm');

or

webRecorder.download();
```
