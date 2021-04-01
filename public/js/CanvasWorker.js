
let handle;
const context = self;

self.addEventListener('message', (e) => {
  const msg = e.data;
  if (msg === 'start') {
    handle = setInterval(() => context.postMessage('message'), 33);
  } else if (msg === 'end') {
    if (handle !== undefined) clearInterval(handle);
  }
});