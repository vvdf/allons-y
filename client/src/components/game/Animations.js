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

export const dodgeShift = (delta, spriteRef, delay, displaceX, displaceY, callback) => {
  if (!{}.hasOwnProperty.call(spriteRef, 'deltas')) {
    const deltas = {
      stepX: true,
      stepY: true,
      dx: 0,
      dy: 0,
      dxEnd: Math.abs(displaceX),
      dyEnd: Math.abs(displaceY),
    };

    spriteRef.deltas = deltas;
  }

  const xDelta = delta / delay;
  const yDelta = delta / (delay * 2);

  if (spriteRef.deltas.stepX && spriteRef.deltas.dx >= spriteRef.deltas.dxEnd) {
    // norgmalize the difference if it goes too far
    spriteRef.deltas.x += spriteRef.deltas.dx - spriteRef.deltas.dxEnd;
    spriteRef.deltas.stepX = false;
  } else if (spriteRef.deltas.stepX) {
    // step animation forward
    spriteRef.deltas.x += xDelta;
    spriteRef.deltas.dx += Math.abs(xDelta);
  }

  if (spriteRef.deltas.stepY && spriteRef.deltas.dy >= spriteRef.deltas.dyEnd) {
    // norgmalize the difference if it goes too far
    spriteRef.deltas.y += spriteRef.deltas.dy - spriteRef.deltas.dyEnd;
    spriteRef.deltas.stepY = false;
  } else if (spriteRef.deltas.stepY) {
    // step animation forward
    spriteRef.deltas.y += yDelta;
    spriteRef.deltas.dy += Math.abs(yDelta);
  }

  if (!spriteRef.deltas.stepX && !spriteRef.deltas.stepY) {
    // if shift is complete on both axis, end animation
    delete spriteRef.deltas;
    callback();
  }
};
