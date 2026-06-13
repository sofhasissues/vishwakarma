import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#7c6af7';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.15);
  ctx.fill();
  
  // Letter V
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('V', size / 2, size / 2);
  
  return canvas.toBuffer('image/png');
}

writeFileSync('icon-192.png', createIcon(192));
writeFileSync('icon-512.png', createIcon(512));
console.log('Icons created');
