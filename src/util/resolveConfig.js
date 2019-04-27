import mergeWith from 'lodash/mergeWith'
import isFunction from 'lodash/isFunction'
import defaults from 'lodash/defaults'
import map from 'lodash/map'
import get from 'lodash/get'

const utils = {
  negative(scale) {
    return Object.keys(scale)
      .filter(key => scale[key] !== '0')
      .reduce(
        (negativeScale, key) => ({
          ...negativeScale,
          [`-${key}`]: `-${scale[key]}`,
        }),
        {}
      )
  },
}

function value(valueToResolve, ...args) {
  return isFunction(valueToResolve) ? valueToResolve(...args) : valueToResolve
}

function mergeExtensions({ extend, ...theme }) {
  return mergeWith(theme, extend, (themeValue, extensions) => {
    if (!isFunction(themeValue) && !isFunction(extensions)) {
      return {
        ...themeValue,
        ...extensions,
      }
    }

    return resolveThemePath => ({
      ...value(themeValue, resolveThemePath),
      ...value(extensions, resolveThemePath),
    })
  })
}

function resolveFunctionKeys(object) {
  const resolveObjectPath = (key, defaultValue) => {
    const val = get(object, key, defaultValue)
    return isFunction(val) ? val(resolveObjectPath) : val
  }

  return Object.keys(object).reduce((resolved, key) => {
    return {
      ...resolved,
      [key]: isFunction(object[key]) ? object[key](resolveObjectPath, utils) : object[key],
    }
  }, {})
}

export default function resolveConfig(configs) {
  return defaults(
    {
      theme: resolveFunctionKeys(mergeExtensions(defaults({}, ...map(configs, 'theme')))),
      variants: defaults({}, ...map(configs, 'variants')),
    },
    ...configs
  )
}
