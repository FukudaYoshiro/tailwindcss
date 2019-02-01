import _ from 'lodash'

export default function({ values, variants }) {
  return function({ addUtilities, e }) {
    const utilities = _.fromPairs(
      _.map(values, (value, modifier) => {
        return [
          `.${e(`bg-${modifier}`)}`,
          {
            'background-size': value,
          },
        ]
      })
    )

    addUtilities(utilities, variants)
  }
}
