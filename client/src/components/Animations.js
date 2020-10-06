export const fadeIn = (delta, spriteRef, delay, callback) => {
  spriteRef.alpha += delta / delay;
  if (spriteRef.alpha >= 1) {
    spriteRef.alpha = 1;
    callback();
  }
};

export const fadeOut = (delta, spriteRef, delay, callback) => {
  spriteRef.alpha -= delta / delay;
  if (spriteRef.alpha <= 0) {
    spriteRef.alpha = 0;
    callback();
  }
};

export const blinkOut = (delta, spriteRef, delay, callback) => {
  const yDelta = delta / (delay / 80);
  const xDelta = spriteRef.height > 5
    ? 50 / spriteRef.height
    : 500 / spriteRef.height;
  spriteRef.height -= yDelta;
  spriteRef.width += xDelta;
  spriteRef.y += yDelta * 23;
  spriteRef.x -= xDelta * 3;
  if (spriteRef.height <= 0) {
    spriteRef.height = 0;
    callback();
  }
};
