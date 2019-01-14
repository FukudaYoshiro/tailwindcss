import lists from './generators/lists'
import appearance from './generators/appearance'
import backgroundAttachment from './generators/backgroundAttachment'
import backgroundColors from './generators/backgroundColors'
import backgroundPosition from './generators/backgroundPosition'
import backgroundRepeat from './generators/backgroundRepeat'

export default [
  { name: 'lists', generator: lists },
  { name: 'appearance', generator: appearance },
  { name: 'backgroundAttachment', generator: backgroundAttachment },
  { name: 'backgroundColors', generator: backgroundColors },
  { name: 'backgroundPosition', generator: backgroundPosition },
  { name: 'backgroundRepeat', generator: backgroundRepeat },
]
