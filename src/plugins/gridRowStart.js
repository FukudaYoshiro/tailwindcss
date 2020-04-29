import createUtilityPlugin from '../util/createUtilityPlugin'

export default function() {
  return function({ config, ...args }) {
    if (config('target') === 'ie11') {
      return
    }

    createUtilityPlugin('gridRowStart', [['row-start', ['gridRowStart']]])({ config, ...args })
  }
}
