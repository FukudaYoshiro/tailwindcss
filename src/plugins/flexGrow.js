import _ from 'lodash'

export default function() {
  return function({ addUtilities, e, config }) {
    addUtilities(
      _.fromPairs(
        _.map(config('theme.flexGrow'), (value, modifier) => {
          const className = modifier === 'default' ? 'flex-grow' : `flex-grow-${modifier}`
          return [
            `.${e(className)}`,
            {
              'flex-grow': value,
            },
          ]
        })
      ),
      config('variants.flexGrow')
    )
  }
}
