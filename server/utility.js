const parseCookies = (cookieString = '') => {
  const result = {};
  const cookieStringFixed = cookieString.replace(' ', '');
  cookieStringFixed.split(';').forEach((val) => {
    const [name, value] = val.split('=');
    result[name] = value;
  });
  return result;
};

const generateID = () => Math.random().toString(36).substring(9);

// TODO replace this placeholder name generator
const nameBankA = ['Metal', 'Super', 'Guardians', 'Armored', 'Ghost', 'Gun', 'Mystery'];
const nameBankB = [' Wolf', ' Street', ' of the', ' Core', ' Busters', ' Breakers', ' Team']
const nameBankC = [' Chaos', ' Fighter', ' Galaxy', ' Raven', ' Live', ' Power', ' Incorporated']
const nameBankD = [' Division', ' Guild', ' Department', ' Unit', ' Squad', ''];
const generateName = () => `${nameBankA[rng(0, 6)]}${nameBankB[rng(0, 6)]}` +
  `${nameBankC[rng(0, 6)]}${nameBankD[rng(0, 5)]}`;

const rng = (min, max) => Math.round(Math.random() * (max - min) + min);

const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

module.exports = {
  parseCookies,
  generateID,
  generateName,
  rng,
  clamp,
};
