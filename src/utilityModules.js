import lists from './generators/lists'
import appearance from './generators/appearance'
import backgroundAttachment from './generators/backgroundAttachment'
import backgroundColors from './generators/backgroundColors'
import backgroundPosition from './generators/backgroundPosition'
import backgroundRepeat from './generators/backgroundRepeat'
import backgroundSize from './generators/backgroundSize'
import borderCollapse from './generators/borderCollapse'
import borderColors from './generators/borderColors'
import borderRadius from './generators/borderRadius'
import borderStyle from './generators/borderStyle'
import borderWidths from './generators/borderWidths'
import cursor from './generators/cursor'
import display from './generators/display'
import flexbox from './generators/flexbox'

export default [
  { name: 'lists', generator: lists },
  { name: 'appearance', generator: appearance },
  { name: 'backgroundAttachment', generator: backgroundAttachment },
  { name: 'backgroundColors', generator: backgroundColors },
  { name: 'backgroundPosition', generator: backgroundPosition },
  { name: 'backgroundRepeat', generator: backgroundRepeat },
  { name: 'backgroundSize', generator: backgroundSize },
  { name: 'borderCollapse', generator: borderCollapse },
  { name: 'borderColors', generator: borderColors },
  { name: 'borderRadius', generator: borderRadius },
  { name: 'borderStyle', generator: borderStyle },
  { name: 'borderWidths', generator: borderWidths },
  { name: 'cursor', generator: cursor },
  { name: 'display', generator: display },
  { name: 'flexbox', generator: flexbox },
]
