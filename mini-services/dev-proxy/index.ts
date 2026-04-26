// Keepalive proxy - pings the Next.js dev server every 10s to prevent it from being killed
setInterval(() => {
  fetch('http://localhost:3000/').catch(() => {});
}, 10000);

console.log('Keepalive proxy started - pinging localhost:3000 every 10s');
