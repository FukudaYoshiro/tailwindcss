import * as constants from '../../constants'
import * as colors from '../colors'
import * as emoji from '../emoji'
import * as utils from '../utils'

export const usage = 'init [file]'
export const description =
  'Creates Tailwind config file. Default: ' +
  colors.file(utils.getSimplePath(constants.defaultConfigFile))

export const options = [
  {
    usage: '--full',
    description: 'Generate complete configuration file.',
  },
  {
    usage: '-p',
    description: 'Generate postcss.config.js file.',
  },
]

export const optionMap = {
  full: ['full'],
  postcss: ['p'],
}

/**
 * Runs the command.
 *
 * @param {string[]} cliParams
 * @param {object} cliOptions
 * @return {Promise}
 */
export function run(cliParams, cliOptions) {
  return new Promise(resolve => {
    utils.header()

    const file = cliParams[0] || constants.defaultConfigFile
    const simplePath = utils.getSimplePath(file)

    utils.exists(file) && utils.die(colors.file(simplePath), 'already exists.')

    const stubFile = cliOptions.full
      ? constants.defaultConfigStubFile
      : constants.simpleConfigStubFile

    const config = require(stubFile)
    const { future: flags } = require('../../featureFlags').default

    flags.forEach(flag => {
      config.future[`// ${flag}`] = true
    })

    utils.writeFile(
      file,
      `module.exports = ${JSON.stringify(config, null, 2).replace(/"([^-_\d"]+)":/g, '$1:')}\n`
    )

    utils.log()
    utils.log(emoji.yes, 'Created Tailwind config file:', colors.file(simplePath))

    if (cliOptions.postcss) {
      const path = utils.getSimplePath(constants.defaultPostCssConfigFile)
      utils.exists(constants.defaultPostCssConfigFile) &&
        utils.die(colors.file(path), 'already exists.')
      utils.copyFile(constants.defaultPostCssConfigStubFile, constants.defaultPostCssConfigFile)
      utils.log(emoji.yes, 'Created PostCSS config file:', colors.file(path))
    }

    utils.footer()

    resolve()
  })
}
