import fs from 'fs'
import postcss from 'postcss'

export default function(config, { components: pluginComponents }, generatedUtilities) {
  return function(css) {
    css.walkAtRules('tailwind', atRule => {
      if (atRule.params === 'preflight') {
        const preflightTree = postcss.parse(
          fs.readFileSync(`${__dirname}/../../css/preflight.css`, 'utf8')
        )

        preflightTree.walk(node => (node.source = atRule.source))

        atRule.before(preflightTree)
        atRule.remove()
      }

      if (atRule.params === 'components') {
        const pluginComponentTree = postcss.root({
          nodes: pluginComponents,
        })

        pluginComponentTree.walk(node => (node.source = atRule.source))

        atRule.before(pluginComponentTree)
        atRule.remove()
      }

      if (atRule.params === 'utilities') {
        generatedUtilities.walk(node => (node.source = atRule.source))
        atRule.before(generatedUtilities)
        atRule.remove()
      }
    })
  }
}
