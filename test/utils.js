/**
 * Module containing helpful utilities for tests
 * @module test/utils
 */

/**
 * Given a source object and a target object, copies the sources' own enumerable properties to
 * the target object, overwriting any properties that have the same name. Note that this function
 * mutates the target object, and does not return a new object.
 * @param {object} source The source object containing properties to copy
 * @param {object} target The target object to copy properties to
 */
const copyPropertyValues = (source, target) => {
  Object.entries(source).forEach(([key, value]) => {
    // eslint-disable-next-line no-param-reassign
    target[key] = value;
  });
};

module.exports = { copyPropertyValues };
