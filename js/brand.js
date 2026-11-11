/*
  brand.js — animated favicon.
  Plays the same 7 frames as the sidebar logo (css/style.css, @keyframes
  mark-drift): the blue ink jumps over the pink one and back, overprinted with
  multiply, at ~2.5 fps like stop motion. Browsers don't animate SVG favicons,
  so each frame is drawn on a canvas and swapped in as a PNG data URL.
  favicon.svg is the static fallback.
*/
(function () {
  const link = document.getElementById("favicon");
  if (!link) return;

  const PINK = "#FF48B0";
  const BLUE = "#3255A4";
  const FRAME_MS = 400; // CSS: 2.8 s / 7 frames
  const S = 64;
  const R = 20;
  const X_PINK = 22;
  const X_BLUE = 42;
  const K = 14 / 11; // logo offsets (viewBox units) → favicon pixels

  // [x, y] offsets of the blue ink per frame, same as the CSS keyframes
  const FRAMES = [
    [0, 0],
    [-2, 0.5],
    [-3.5, -0.5],
    [-5.5, 0.5],
    [-7.5, 0],
    [-9.5, -0.5],
    [-11, 0.5],
  ];
  // CSS "alternate": there and back, each end frame shown twice
  const SEQUENCE = FRAMES.map((_, i) => i).concat(FRAMES.map((_, i) => FRAMES.length - 1 - i));

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = S;
  const ctx = canvas.getContext("2d");

  // Render every frame once, then only swap URLs
  const urls = FRAMES.map(([dx, dy]) => {
    ctx.clearRect(0, 0, S, S);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = PINK;
    ctx.beginPath();
    ctx.arc(X_PINK, S / 2, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "multiply"; // over transparent it stays blue; over pink it darkens
    ctx.fillStyle = BLUE;
    ctx.beginPath();
    ctx.arc(X_BLUE + dx * K, S / 2 + dy * K, R, 0, Math.PI * 2);
    ctx.fill();
    return canvas.toDataURL("image/png");
  });

  function show(i) {
    link.type = "image/png";
    link.href = urls[i];
  }

  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) {
    show(3);
    return;
  }

  let step = 0;
  show(SEQUENCE[0]);
  setInterval(() => {
    step = (step + 1) % SEQUENCE.length;
    show(SEQUENCE[step]);
  }, FRAME_MS);
})();
