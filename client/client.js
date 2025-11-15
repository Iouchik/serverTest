'use strict'
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

let W = 1100;
let H = 800;

canvas.width = W;
canvas.height = H;

const ws = new WebSocket(`ws://${window.location.host}`);
ws.onopen = onopen;
ws.onclose = onclose;
ws.onmessage = onmessage;
ws.binaryType = "arraybuffer";

function onopen() {
    console.log('websocket opened');
}

function onclose() {
    console.log('websocked closed');
}

const keys = {};

window.addEventListener("keydown", (e) => {keys[e.code] = true});
window.addEventListener("keyup", (e) => {keys[e.code] = false});

function onmessage(msg) {
  let bf = new Uint16Array(msg.data);
  let bff = new ArrayBuffer(2);
  let bbf = new Uint8Array(bff);
  ctx.clearRect(0, 0, W, H);
  for (let i = 0; i < bf.length; i++) {
    ctx.fillRect(bf[i * 2] - 32768 + (W / 2), bf[i * 2 + 1] - 32768 + (H / 2), 20, 20);
  }
  bbf[0] = 1;
  bbf[1] = 1;
  if (keys.ArrowUp) bbf[0] += 1;
  if (keys.ArrowDown) bbf[0] -= 1;
  if (keys.ArrowRight) bbf[1] += 1;
  if (keys.ArrowLeft) bbf[1] -= 1;
  ws.send(bbf);
}