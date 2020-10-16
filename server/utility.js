const parseCookies = (cookieString = '') => {
  const result = {};
  const cookieStringFixed = cookieString.replace(' ', '');
  cookieStringFixed.split(';').forEach((val) => {
    const [name, value] = val.split('=');
    result[name] = value;
  });
  return result;
};

module.exports = {
  parseCookies,
};
