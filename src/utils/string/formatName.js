

/**
 * Capitalises the first letter of each word and lowercases the rest.
 * Handles 1, 2, 3, 4… word names.
 * @param {string} name
 * @returns {string}
 */
const formatName = (name) => {
  if (!name || name.trim().length === 0) return '';
  return name
    .trim()
    .split(/\s+/)  // to split
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};


/**
 * Returns only the first word of a name, properly capitalized.
 * e.g. "john michael doe" → "John"
 * @param {string} fullName
 * @returns {string}
 */
const getFirstName = (fullName) => {
  if (!fullName || fullName.trim().length === 0) return '';
  const firstWord = fullName.trim().split(/\s+/)[0];
  return formatName(firstWord);
};


// export the functions
module.exports = { formatName, getFirstName };
