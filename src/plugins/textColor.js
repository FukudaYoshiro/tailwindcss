import _ from 'lodash'
import flattenColorPalette from '../util/flattenColorPalette'
import withAlphaVariable from '../util/withAlphaVariable'

export default function() {
  return function({ addUtilities, e, theme, variants, target, corePlugins }) {
    const colors = flattenColorPalette(theme('textColor'))

    const getProperties = value => {
      if (target('textColor') === 'ie11') {
        return { color: value }
      }

      if (corePlugins('textOpacity')) {
        return withAlphaVariable({
          color: value,
          property: 'color',
          variable: '--text-opacity',
        })
      }

      return { color: value }
    }

    const utilities = _.fromPairs(
      _.map(colors, (value, modifier) => {
        return [`.${e(`text-${modifier}`)}`, getProperties(value)]
      })
    )

    addUtilities(utilities, variants('textColor'))
  }
}
