// A tiny placeholder QR renderer. It draws a stylised "QR" label and the
// text value beneath it so users can copy the room URL manually. In a
// production app you may replace this with a real QR code library.
window.drawFakeQR = function(canvas, text) {
  const ctx = canvas.getContext('2d');
  // Clear canvas
  ctx.fillStyle = '#0b1328';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Draw the "QR" label
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '16px system-ui';
  ctx.fillText('QR', 8, 20);
  // Draw wrapped text (room URL)
  ctx.font = '12px system-ui';
  const maxWidth = canvas.width - 16;
  let y = 46;
  let line = '';
  for (let i = 0; i < text.length; i++) {
    const testLine = line + text[i];
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      ctx.fillText(line, 8, y);
      line = text[i];
      y += 18;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 8, y);
  // Draw corner squares to hint at a QR
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  const s = 40;
  ctx.strokeRect(6, 6, s, s);
  ctx.strokeRect(canvas.width - (s + 6), 6, s, s);
  ctx.strokeRect(6, canvas.height - (s + 6), s, s);
};