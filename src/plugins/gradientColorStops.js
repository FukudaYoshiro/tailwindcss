import _ from 'lodash'
import flattenColorPalette from '../util/flattenColorPalette'
import nameClass from '../util/nameClass'
import toColorValue from '../util/toColorValue'
import { withAlphaValue } from '../util/withAlphaVariable'

export default function () {
  return function ({ addUtilities, theme, variants }) {
    const colors = flattenColorPalette(theme('gradientColorStops'))

    const utilities = _(colors)
      .map((value, modifier) => {
        const transparentTo = withAlphaValue(value, 0, 'rgba(255, 255, 255, 0)')

        return [
          [
            nameClass('from', modifier),
            {
              '--tw-gradient-from': toColorValue(value, 'from'),
              '--tw-gradient-stops': `var(--tw-gradient-from), var(--tw-gradient-to, ${transparentTo})`,
            },
          ],
          [
            nameClass('via', modifier),
            {
              '--tw-gradient-stops': `var(--tw-gradient-from), ${toColorValue(
                value,
                'via'
              )}, var(--tw-gradient-to, ${transparentTo})`,
            },
          ],
          [
            nameClass('to', modifier),
            {
              '--tw-gradient-to': toColorValue(value, 'to'),
            },
          ],
        ]
      })
      .unzip()
      .flatten()
      .fromPairs()
      .value()

    addUtilities(utilities, variants('gradientColorStops'))
  }
}
