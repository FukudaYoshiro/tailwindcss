import _ from 'lodash'

export default function() {
  return function({ addUtilities, e, config }) {
    const utilities = _.fromPairs(
      _.map(config('theme.flex'), (value, modifier) => {
        return [
          `.${e(`flex-${modifier}`)}`,
          {
            flex: value,
          },
        ]
      })
    )

    addUtilities(utilities, config('variants.flex'))
  }
}
