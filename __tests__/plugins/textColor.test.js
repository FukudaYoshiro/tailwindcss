import _ from 'lodash'
import escapeClassName from '../../src/util/escapeClassName'
import plugin from '../../src/plugins/textColor'

test('colors can be a nested object', () => {
  const addedUtilities = []

  const config = {
    theme: {
      textColor: {
        purple: 'purple',
        red: {
          1: 'rgb(33,0,0)',
          2: 'rgb(67,0,0)',
          3: 'rgb(100,0,0)',
        },
        green: {
          1: 'rgb(0,33,0)',
          2: 'rgb(0,67,0)',
          3: 'rgb(0,100,0)',
        },
        blue: {
          1: 'rgb(0,0,33)',
          2: 'rgb(0,0,67)',
          3: 'rgb(0,0,100)',
        },
      },
    },
    variants: {
      textColor: ['responsive'],
    },
  }

  const pluginApi = {
    config: (key, defaultValue) => _.get(config, key, defaultValue),
    e: escapeClassName,
    addUtilities(utilities, variants) {
      addedUtilities.push({
        utilities,
        variants,
      })
    },
  }

  plugin()(pluginApi)

  expect(addedUtilities).toEqual([
    {
      utilities: {
        '.text-purple': { color: 'purple' },
        '.text-red-1': { color: 'rgb(33,0,0)' },
        '.text-red-2': { color: 'rgb(67,0,0)' },
        '.text-red-3': { color: 'rgb(100,0,0)' },
        '.text-green-1': { color: 'rgb(0,33,0)' },
        '.text-green-2': { color: 'rgb(0,67,0)' },
        '.text-green-3': { color: 'rgb(0,100,0)' },
        '.text-blue-1': { color: 'rgb(0,0,33)' },
        '.text-blue-2': { color: 'rgb(0,0,67)' },
        '.text-blue-3': { color: 'rgb(0,0,100)' },
      },
      variants: ['responsive'],
    },
  ])
})
