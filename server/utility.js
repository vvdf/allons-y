const parseCookies = (cookieString = '') => {
  const result = {};
  const cookieStringFixed = cookieString.replace(' ', '');
  cookieStringFixed.split(';').forEach((val) => {
    const [name, value] = val.split('=');
    result[name] = value;
  });
  return result;
};

const rng = (min, max) => Math.round(Math.random() * (max - min) + min);

module.exports = {
  parseCookies,
  rng,
};
