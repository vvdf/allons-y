// helper functions
export const clamp = (value, min, max) => Math.max(Math.min(value, max), min);

export const formatNoun = (str) => `${str.substr(0, 1).toUpperCase()}${str.substr(1).toLowerCase()}`;
