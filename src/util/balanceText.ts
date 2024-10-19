type Combination = boolean[];

export default function balanceTextBreaks(
  element: HTMLElement,
): void {
  const splits = element.textContent.trim().split(' ')
  if (!splits.length) return

  const numBreaks: number = splits.length - 1
  
  const measureElement = document.createElement('span')
  element.appendChild(measureElement)

  // If text is small enough, use brute force approach
  // Otherwise use simplified algorithm approach
  const possibilities: Combination[] = numBreaks <= 10
    ? getPossibilitiesBruteForce(splits)
    : getPossibilitiesSimplified(splits)
  
  const targetWidth: number = document.documentElement.clientWidth
  const targetHeight: number = document.documentElement.clientHeight
  const targetAngle: number = Math.atan(targetWidth / targetHeight)
  let bestScore: number = Infinity
  let bestCombination: Combination | undefined
  let bestWidth: number | undefined
  let bestHeight: number | undefined

  for (const combination of possibilities) {
    measureElement.innerHTML = renderCombinationString(splits, combination)
    const rect = measureElement.getBoundingClientRect()
    const angle = Math.atan(rect.width / rect.height)

    // Calculate angle score and line length penalty
    const angleScore = Math.pow(Math.abs(angle - targetAngle), 2)
    const lineLengthPenalty = calculateLineLengthPenalty(splits, combination)
    const breakScore = combination.reduce((sum, e) => e ? sum + 1 : sum, 0)
    const totalScore = angleScore + lineLengthPenalty + breakScore

    if (totalScore < bestScore) {
      bestScore = totalScore
      bestCombination = combination
      bestWidth = rect.width
      bestHeight = rect.height
    }
  }

  // Apply best combination
  element.removeChild(measureElement)
  if (!bestCombination) return

  const xScale = targetWidth / bestWidth
  const yScale = targetHeight / bestHeight
  const scale = Math.min(xScale, yScale)
  element.style.fontSize = scale.toFixed(2) + 'em'
  
  for (let i = 0; i < bestCombination.length; i++) {
    if (!bestCombination[i]) continue
    const needle = splits[i]
    const regex = new RegExp(`(?:^|\\b)${needle}(?:\\b|$)`)
    const child = searchChild(element, regex)
    const parts = child.data.split(regex)
    child.replaceWith(
      parts[0] + needle,
      document.createElement('br'),
      parts[1] ?? ''
    )
  }
}

function getPossibilitiesBruteForce (splits: string[]): Combination[] {
  const numBreaks: number = splits.length - 1
  const possibilities: Combination[] = []
  const numCombinations: number = Math.pow(2, numBreaks)

  for (let i = 0; i < numCombinations; i++) {
    const combination: Combination = []
    for (let j = 0; j < numBreaks; j++) {
      combination.push(!!(i & (1 << j)))
    }
    possibilities.push(combination)
  }

  return possibilities
}

function getPossibilitiesSimplified (splits: string[]): Combination[] {
  const numBreaks: number = splits.length - 1
  const expectedBreaks: number = Math.round(splits.length / 5)
  const wordsPerBreak: number = Math.round(splits.length / expectedBreaks)
  const possibilities: Combination[] = []

  const combination: Combination = []
  for (let j = 0; j < numBreaks; j++) {
    combination.push((j + 1) % wordsPerBreak === 0)
  }
  possibilities.push(combination)

  return possibilities
}

function renderCombinationString (splits: string[], combination: Combination) {
  let content = splits[0]
  for (let i = 0; i < combination.length; i++) {
    if (combination[i]) {
      content += '<br>'
    } else {
      content += ' '
    }
    content += splits[i + 1]
  }
  return content
}

function calculateLineLengthPenalty (splits: string[], combination: Combination): number {
  const lines: string[] = []
  let currentLine = splits[0]

  for (let i = 0; i < combination.length; i++) {
    if (combination[i]) {
      lines.push(currentLine)
      currentLine = splits[i + 1]
    } else {
      currentLine += ' ' + splits[i + 1]
    }
  }
  lines.push(currentLine)
  
  if (lines.length === 1) {
    return lines[0].length * 0.1
  }

  const lineLengths = lines.map(line => line.length)
  const maxLineLength = Math.max(...lineLengths)
  const minLineLength = Math.min(...lineLengths)

  return (maxLineLength - minLineLength) * 0.01
}

function searchChild (element: HTMLElement | ChildNode, regex: RegExp): Text | undefined {
  for (const child of element.childNodes) {
    if (child instanceof Text) {
      if (regex.test(child.data)) {
        return child
      }
    } else {
      const result = searchChild(child, regex)
      if (result) return result
    }
  }
}
