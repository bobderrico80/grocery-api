/**
 * Provides a utility function for removing fields from an object or an array of objects.
 * @module sanitizeResponse
 */

/**
 * Removes the given fields from the given object
 * @param {object} data The object to remove fields from.
 * @param {string|[]} fieldsToRemove The fields to remove.
 * @return {object} The object with fields removed.
 * @private
 */
const removeFieldsFromSingleObject = (data, fieldsToRemove) =>
  fieldsToRemove.reduce((sanitizedData, fieldToRemove) => {
    if (typeof sanitizedData[fieldToRemove] !== 'undefined') {
      const { [fieldToRemove]: _, ...rest } = sanitizedData;
      return rest;
    }

    return sanitizedData;
  }, data);

/**
 * Calls `toJSON()` on the data object if the function exists, and returns its result. Otherwise,
 * just returns the data object.
 * @param {object} data The data object to possibly extract JSON from.
 * @private
 */
const extractJSON = (data) => {
  if (typeof data.toJSON === 'function') {
    return data.toJSON();
  }

  return data;
};

/**
 * Given an object or an array of objects, and an array of field names to remove, this function will
 * remove the fields the object or each object in the array. This function will also handle objects
 * containing a toJSON() method (such as Sequelize model instances) by performing the removal on the
 * result of the toJSON() call.
 * @param {object|object[]} data An object or an array of objects to have fields removed from.
 * @param {string[]} fieldsToRemove An array of the fields that should be removed.
 * @return {object|object[]} The object or array of objects with fields removed.
 */
const removeFields = (data, fieldsToRemove) => {
  if (Array.isArray(data)) {
    return data.map(object => removeFieldsFromSingleObject(extractJSON(object), fieldsToRemove));
  }

  return removeFieldsFromSingleObject(extractJSON(data), fieldsToRemove);
};

module.exports = removeFields;
