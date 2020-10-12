// helper functions
export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export const formatNoun = (str) => {
  const multipleWords = str.split(' ');
  let result = '';
  multipleWords.forEach((word) => {
    result += `${word.substr(0, 1).toUpperCase()}${word.substr(1).toLowerCase()}`;
  });
  return result;
};
