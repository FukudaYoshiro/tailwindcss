import createUtilityPlugin from '../util/createUtilityPlugin'

export default function () {
  return function ({ config, ...rest }) {
    if (config('mode') === 'jit') {
      return createUtilityPlugin('scale', [
        [
          'scale',
          [
            ['@defaults transform', {}],
            '--tw-scale-x',
            '--tw-scale-y',
            ['transform', 'var(--tw-transform)'],
          ],
        ],
        [
          [
            'scale-x',
            [['@defaults transform', {}], '--tw-scale-x', ['transform', 'var(--tw-transform)']],
          ],
          [
            'scale-y',
            [['@defaults transform', {}], '--tw-scale-y', ['transform', 'var(--tw-transform)']],
          ],
        ],
      ])({ config, ...rest })
    } else {
      return createUtilityPlugin('scale', [
        ['scale', ['--tw-scale-x', '--tw-scale-y']],
        [
          ['scale-x', ['--tw-scale-x']],
          ['scale-y', ['--tw-scale-y']],
        ],
      ])({ config, ...rest })
    }
  }
}
