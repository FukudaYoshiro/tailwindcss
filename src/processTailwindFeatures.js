import _ from 'lodash'
import postcss from 'postcss'

import substituteTailwindAtRules from './lib/substituteTailwindAtRules'
import evaluateTailwindFunctions from './lib/evaluateTailwindFunctions'
import substituteVariantsAtRules from './lib/substituteVariantsAtRules'
import substituteResponsiveAtRules from './lib/substituteResponsiveAtRules'
import convertLayerAtRulesToControlComments from './lib/convertLayerAtRulesToControlComments'
import substituteScreenAtRules from './lib/substituteScreenAtRules'
import substituteClassApplyAtRules from './lib/substituteClassApplyAtRules'
import applyImportantConfiguration from './lib/applyImportantConfiguration'
import purgeUnusedStyles from './lib/purgeUnusedStyles'

import corePlugins from './corePlugins'
import processPlugins from './util/processPlugins'
import cloneNodes from './util/cloneNodes'
import { issueFlagNotices } from './featureFlags.js'

import hash from 'object-hash'

let flagsIssued = null
let previousConfig = null
let processedPlugins = null
let getProcessedPlugins = null

export default function(getConfig) {
  return function(css) {
    const config = getConfig()
    const configChanged = hash(previousConfig) !== hash(config)
    previousConfig = config

    if (!flagsIssued || !_.isEqual(flagsIssued, _.pick(config, ['future', 'experimental']))) {
      flagsIssued = _.pick(config, ['future', 'experimental'])
      issueFlagNotices(config)
    }

    if (configChanged) {
      processedPlugins = processPlugins([...corePlugins(config), ...config.plugins], config)
      getProcessedPlugins = function() {
        return {
          ...processedPlugins,
          base: cloneNodes(processedPlugins.base),
          components: cloneNodes(processedPlugins.components),
          utilities: cloneNodes(processedPlugins.utilities),
        }
      }
    }

    return postcss([
      substituteTailwindAtRules(config, getProcessedPlugins()),
      evaluateTailwindFunctions(config),
      substituteVariantsAtRules(config, getProcessedPlugins()),
      substituteResponsiveAtRules(config),
      convertLayerAtRulesToControlComments(config),
      substituteScreenAtRules(config),
      substituteClassApplyAtRules(config, getProcessedPlugins, configChanged),
      applyImportantConfiguration(config),
      purgeUnusedStyles(config),
    ]).process(css, { from: _.get(css, 'source.input.file') })
  }
}
