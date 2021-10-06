import selectorParser from 'postcss-selector-parser'
import escapeCommas from './escapeCommas'
import { withAlphaValue } from './withAlphaVariable'
import isKeyframeRule from './isKeyframeRule'
import {
  normalize,
  length,
  number,
  percentage,
  url,
  color as validateColor,
  genericName,
  familyName,
  image,
  absoluteSize,
  relativeSize,
  position,
  lineWidth,
} from './dataTypes'
import negateValue from './negateValue'

export function applyStateToMarker(selector, marker, state, join) {
  let markerIdx = selector.search(new RegExp(`${marker}[:[]`))

  if (markerIdx === -1) {
    return join(marker + state, selector)
  }

  let markerSelector = selector.slice(markerIdx, selector.indexOf(' ', markerIdx))

  return join(
    marker + state + markerSelector.slice(markerIdx + marker.length),
    selector.replace(markerSelector, '')
  )
}

export function updateAllClasses(selectors, updateClass) {
  let parser = selectorParser((selectors) => {
    selectors.walkClasses((sel) => {
      let updatedClass = updateClass(sel.value, {
        withAttr(className, attr) {
          sel.parent.insertAfter(sel, selectorParser.attribute({ attribute: attr.slice(1, -1) }))
          return className
        },
        withPseudo(className, pseudo) {
          sel.parent.insertAfter(sel, selectorParser.pseudo({ value: pseudo }))
          return className
        },
      })
      sel.value = updatedClass
      if (sel.raws && sel.raws.value) {
        sel.raws.value = escapeCommas(sel.raws.value)
      }
    })
  })

  let result = parser.processSync(selectors)

  return result
}

export function updateLastClasses(selectors, updateClass) {
  let parser = selectorParser((selectors) => {
    selectors.each((sel) => {
      let lastClass = sel.filter(({ type }) => type === 'class').pop()

      if (lastClass === undefined) {
        return
      }

      let updatedClass = updateClass(lastClass.value, {
        withPseudo(className, pseudo) {
          lastClass.parent.insertAfter(lastClass, selectorParser.pseudo({ value: `${pseudo}` }))
          return className
        },
      })
      lastClass.value = updatedClass
      if (lastClass.raws && lastClass.raws.value) {
        lastClass.raws.value = escapeCommas(lastClass.raws.value)
      }
    })
  })
  let result = parser.processSync(selectors)

  return result
}

function splitByNotEscapedCommas(str) {
  let chunks = []
  let currentChunk = ''
  for (let i = 0; i < str.length; i++) {
    if (str[i] === ',' && str[i - 1] !== '\\') {
      chunks.push(currentChunk)
      currentChunk = ''
    } else {
      currentChunk += str[i]
    }
  }
  chunks.push(currentChunk)
  return chunks
}

export function transformAllSelectors(transformSelector, { wrap, withRule } = {}) {
  return ({ container }) => {
    container.walkRules((rule) => {
      if (isKeyframeRule(rule)) {
        return rule
      }
      let transformed = splitByNotEscapedCommas(rule.selector).map(transformSelector).join(',')
      rule.selector = transformed
      if (withRule) {
        withRule(rule)
      }
      return rule
    })

    if (wrap) {
      let wrapper = wrap()
      let nodes = container.nodes
      container.removeAll()
      wrapper.append(nodes)
      container.append(wrapper)
    }
  }
}

export function transformAllClasses(transformClass, { wrap, withRule } = {}) {
  return ({ container }) => {
    container.walkRules((rule) => {
      let selector = rule.selector
      let variantSelector = updateAllClasses(selector, transformClass)
      rule.selector = variantSelector
      if (withRule) {
        withRule(rule)
      }
      return rule
    })

    if (wrap) {
      let wrapper = wrap()
      let nodes = container.nodes
      container.removeAll()
      wrapper.append(nodes)
      container.append(wrapper)
    }
  }
}

export function transformLastClasses(transformClass, { wrap, withRule } = {}) {
  return ({ container }) => {
    container.walkRules((rule) => {
      let selector = rule.selector
      let variantSelector = updateLastClasses(selector, transformClass)
      rule.selector = variantSelector
      if (withRule) {
        withRule(rule)
      }
      return rule
    })

    if (wrap) {
      let wrapper = wrap()
      let nodes = container.nodes
      container.removeAll()
      wrapper.append(nodes)
      container.append(wrapper)
    }
  }
}

function resolveArbitraryValue(modifier, validate) {
  if (!isArbitraryValue(modifier)) {
    return undefined
  }

  let value = modifier.slice(1, -1)

  if (!validate(value)) {
    return undefined
  }

  return normalize(value)
}

function asNegativeValue(modifier, lookup = {}, validate) {
  let positiveValue = lookup[modifier]

  if (positiveValue !== undefined) {
    return negateValue(positiveValue)
  }

  if (isArbitraryValue(modifier)) {
    let resolved = resolveArbitraryValue(modifier, validate)

    if (resolved === undefined) {
      return undefined
    }

    return negateValue(resolved)
  }
}

export function asValue(modifier, options = {}, { validate = () => true } = {}) {
  let value = options.values?.[modifier]

  if (value !== undefined) {
    return value
  }

  if (options.supportsNegativeValues && modifier.startsWith('-')) {
    return asNegativeValue(modifier.slice(1), options.values, validate)
  }

  return resolveArbitraryValue(modifier, validate)
}

function isArbitraryValue(input) {
  return input.startsWith('[') && input.endsWith(']')
}

function splitAlpha(modifier) {
  let slashIdx = modifier.lastIndexOf('/')

  if (slashIdx === -1 || slashIdx === modifier.length - 1) {
    return [modifier]
  }

  return [modifier.slice(0, slashIdx), modifier.slice(slashIdx + 1)]
}

export function asColor(modifier, options = {}, { tailwindConfig = {} } = {}) {
  if (options.values?.[modifier] !== undefined) {
    return options.values?.[modifier]
  }

  let [color, alpha] = splitAlpha(modifier)

  if (alpha !== undefined) {
    let normalizedColor =
      options.values?.[color] ?? (isArbitraryValue(color) ? color.slice(1, -1) : undefined)

    if (normalizedColor === undefined) {
      return undefined
    }

    if (isArbitraryValue(alpha)) {
      return withAlphaValue(normalizedColor, alpha.slice(1, -1))
    }

    if (tailwindConfig.theme?.opacity?.[alpha] === undefined) {
      return undefined
    }

    return withAlphaValue(normalizedColor, tailwindConfig.theme.opacity[alpha])
  }

  return asValue(modifier, options, { validate: validateColor })
}

export function asLookupValue(modifier, options = {}) {
  return options.values?.[modifier]
}

function guess(validate) {
  return (modifier, options) => {
    return asValue(modifier, options, { validate })
  }
}

let typeMap = {
  any: asValue,
  color: asColor,
  url: guess(url),
  image: guess(image),
  length: guess(length),
  percentage: guess(percentage),
  position: guess(position),
  lookup: asLookupValue,
  'generic-name': guess(genericName),
  'family-name': guess(familyName),
  number: guess(number),
  'line-width': guess(lineWidth),
  'absolute-size': guess(absoluteSize),
  'relative-size': guess(relativeSize),
}

let supportedTypes = Object.keys(typeMap)

function splitAtFirst(input, delim) {
  let idx = input.indexOf(delim)
  if (idx === -1) return [undefined, input]
  return [input.slice(0, idx), input.slice(idx + 1)]
}

export function coerceValue(types, modifier, options, tailwindConfig) {
  if (isArbitraryValue(modifier)) {
    let [explicitType, value] = splitAtFirst(modifier.slice(1, -1), ':')

    if (explicitType !== undefined && !supportedTypes.includes(explicitType)) {
      return []
    }

    if (value.length > 0 && supportedTypes.includes(explicitType)) {
      return [asValue(`[${value}]`, options), explicitType]
    }
  }

  // Find first matching type
  for (let type of [].concat(types)) {
    let result = typeMap[type](modifier, options, { tailwindConfig })
    if (result) return [result, type]
  }

  return []
}
