import _ from 'lodash'

export default function flattenColorPalette(colors) {
  const result = _(colors)
    .flatMap((color, name) => {
      if (_.isFunction(color) || !_.isObject(color)) {
        return [[name, color]]
      }

      return _.map(color, (value, key) => {
        const suffix = key === 'DEFAULT' ? '' : `-${key}`
        return [`${name}${suffix}`, value]
      })
    })
    .fromPairs()
    .value()

  return result
}
