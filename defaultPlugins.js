const scales = require('./defaultScales')

module.exports = function() {
  return [
    require('./plugins/lists')({ variants: scales.modules.lists }),
    require('./plugins/appearance')({ variants: scales.modules.appearance }),
    require('./plugins/backgroundAttachment')({ variants: scales.modules.backgroundAttachment }),
    require('./plugins/backgroundColors')({
      values: scales.backgroundColors,
      variants: scales.modules.backgroundColors,
    }),
    require('./plugins/backgroundPosition')({ variants: scales.modules.backgroundPosition }),
    require('./plugins/backgroundRepeat')({ variants: scales.modules.backgroundRepeat }),
    require('./plugins/backgroundSize')({
      values: scales.backgroundSize,
      variants: scales.modules.backgroundSize,
    }),
    require('./plugins/borderCollapse')({ variants: scales.modules.borderCollapse }),
    require('./plugins/borderColors')({
      values: scales.borderColors,
      variants: scales.modules.borderColors,
    }),
    require('./plugins/borderRadius')({
      values: scales.borderRadius,
      variants: scales.modules.borderRadius,
    }),
    require('./plugins/borderStyle')({ variants: scales.modules.borderStyle }),
    require('./plugins/borderWidths')({
      values: scales.borderWidths,
      variants: scales.modules.borderWidths,
    }),
    require('./plugins/cursor')({ variants: scales.modules.cursor }),
    require('./plugins/display')({ variants: scales.modules.display }),
    require('./plugins/flexbox')({ variants: scales.modules.flexbox }),
    require('./plugins/float')({ variants: scales.modules.float }),
    require('./plugins/fonts')({ values: scales.fonts, variants: scales.modules.fonts }),
    require('./plugins/fontWeights')({
      values: scales.fontWeights,
      variants: scales.modules.fontWeights,
    }),
    require('./plugins/height')({ values: scales.height, variants: scales.modules.height }),
    require('./plugins/leading')({ values: scales.leading, variants: scales.modules.leading }),
    require('./plugins/margin')({ values: scales.margin, variants: scales.modules.margin }),
    require('./plugins/maxHeight')({
      values: scales.maxHeight,
      variants: scales.modules.maxHeight,
    }),
    require('./plugins/maxWidth')({ values: scales.maxWidth, variants: scales.modules.maxWidth }),
    require('./plugins/minHeight')({
      values: scales.minHeight,
      variants: scales.modules.minHeight,
    }),
    require('./plugins/minWidth')({ values: scales.minWidth, variants: scales.modules.minWidth }),
    require('./plugins/negativeMargin')({
      values: scales.negativeMargin,
      variants: scales.modules.negativeMargin,
    }),
    // require('./plugins/objectFit')({ variants: scales.modules.objectFit }),
    // require('./plugins/objectPosition')({ variants: scales.modules.objectPosition }),
    require('./plugins/opacity')({ values: scales.opacity, variants: scales.modules.opacity }),
    require('./plugins/outline')({ variants: scales.modules.outline }),
    require('./plugins/overflow')({ variants: scales.modules.overflow }),
    require('./plugins/padding')({ values: scales.padding, variants: scales.modules.padding }),
    require('./plugins/pointerEvents')({ variants: scales.modules.pointerEvents }),
    require('./plugins/position')({ variants: scales.modules.position }),
    require('./plugins/resize')({ variants: scales.modules.resize }),
    require('./plugins/shadows')({ values: scales.shadows, variants: scales.modules.shadows }),
    require('./plugins/svgFill')({ values: scales.svgFill, variants: scales.modules.svgFill }),
    require('./plugins/svgStroke')({
      values: scales.svgStroke,
      variants: scales.modules.svgStroke,
    }),
    require('./plugins/tableLayout')({ variants: scales.modules.tableLayout }),
    require('./plugins/textAlign')({ variants: scales.modules.textAlign }),
    require('./plugins/textColors')({
      values: scales.textColors,
      variants: scales.modules.textColors,
    }),
    require('./plugins/textSizes')({
      values: scales.textSizes,
      variants: scales.modules.textSizes,
    }),
    require('./plugins/textStyle')({ variants: scales.modules.textStyle }),
    require('./plugins/tracking')({ values: scales.tracking, variants: scales.modules.tracking }),
    require('./plugins/userSelect')({ variants: scales.modules.userSelect }),
    require('./plugins/verticalAlign')({ variants: scales.modules.verticalAlign }),
    require('./plugins/visibility')({ variants: scales.modules.visibility }),
    require('./plugins/whitespace')({ variants: scales.modules.whitespace }),
    require('./plugins/width')({ values: scales.width, variants: scales.modules.width }),
    require('./plugins/zIndex')({ values: scales.zIndex, variants: scales.modules.zIndex }),
  ]
}
