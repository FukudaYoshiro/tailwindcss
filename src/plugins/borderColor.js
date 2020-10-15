import _ from 'lodash'
import flattenColorPalette from '../util/flattenColorPalette'
import toColorValue from '../util/toColorValue'
import withAlphaVariable from '../util/withAlphaVariable'

export default function() {
  return function({ addUtilities, e, theme, variants, corePlugins }) {
    const colors = flattenColorPalette(theme('borderColor'))

    const getProperties = value => {
      if (corePlugins('borderOpacity')) {
        return withAlphaVariable({
          color: value,
          property: 'border-color',
          variable: '--border-opacity',
        })
      }

      return { 'border-color': toColorValue(value) }
    }

    const utilities = _.fromPairs(
      _.map(_.omit(colors, 'default'), (value, modifier) => {
        return [`.${e(`border-${modifier}`)}`, getProperties(value)]
      })
    )

    addUtilities(utilities, variants('borderColor'))
  }
}
