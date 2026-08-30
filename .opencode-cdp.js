const ws = new WebSocket(process.argv[2]);
ws.onopen = () => ws.send(JSON.stringify({
  id: 1,
  method: 'Runtime.evaluate',
  params: { expression: process.argv[3], returnByValue: true, awaitPromise: true }
}));
ws.onmessage = (event) => {
  console.log(event.data);
  process.exit();
};
setTimeout(() => process.exit(2), 5000);
