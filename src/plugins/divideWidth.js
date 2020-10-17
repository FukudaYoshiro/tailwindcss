import _ from 'lodash'
import nameClass from '../util/nameClass'

export default function () {
  return function ({ addUtilities, theme, variants }) {
    const generators = [
      (_size, modifier) => {
        const size = _size === '0' ? '0px' : _size
        return {
          [`${nameClass('divide-y', modifier)} > :not(template) ~ :not(template)`]: {
            '--divide-y-reverse': '0',
            'border-top-width': `calc(${size} * calc(1 - var(--divide-y-reverse)))`,
            'border-bottom-width': `calc(${size} * var(--divide-y-reverse))`,
          },
          [`${nameClass('divide-x', modifier)} > :not(template) ~ :not(template)`]: {
            '--divide-x-reverse': '0',
            'border-inline-end-width': `calc(${size} * var(--divide-x-reverse))`,
            'border-inline-start-width': `calc(${size} * calc(1 - var(--divide-x-reverse)))`,
          },
        }
      },
    ]

    const utilities = _.flatMap(generators, (generator) => {
      return [
        ..._.flatMap(theme('divideWidth'), (value, modifier) => {
          return generator(value, modifier)
        }),
        {
          '.divide-y-reverse > :not(template) ~ :not(template)': {
            '--divide-y-reverse': '1',
          },
          '.divide-x-reverse > :not(template) ~ :not(template)': {
            '--divide-x-reverse': '1',
          },
        },
      ]
    })

    addUtilities(utilities, variants('divideWidth'))
  }
}
