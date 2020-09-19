const parseCookies = (cookieString = '') => {
  const result = {};
  cookieString.split(';').forEach((val) => {
    const [name, value] = val.split('=');
    result[name] = value;
  });
  return result;
};

module.exports = {
  parseCookies,
};
