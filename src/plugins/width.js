import _ from 'lodash'

export default function({ values, variants }) {
  return function({ addUtilities, e }) {
    const utilities = _.fromPairs(
      _.map(values, (value, modifier) => {
        return [
          `.${e(`w-${modifier}`)}`,
          {
            width: value,
          },
        ]
      })
    )

    addUtilities(utilities, variants)
  }
}
