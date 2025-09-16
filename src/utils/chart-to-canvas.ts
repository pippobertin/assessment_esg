/**
 * Utility per convertire grafici Recharts in canvas per l'esportazione PDF
 */

export interface ChartCanvasOptions {
  width?: number
  height?: number
  backgroundColor?: string
}

/**
 * Converte un grafico a ragnatela in canvas usando dati grezzi
 */
export function createRadarChartCanvas(
  data: Array<{
    category: string
    azienda: number
    settore: number
    'PMI Italiane': number
  }>,
  options: ChartCanvasOptions = {}
): HTMLCanvasElement {
  const {
    width = 500,
    height = 400,
    backgroundColor = '#ffffff'
  } = options

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!

  // Riempimento sfondo
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Configurazione del grafico con più spazio e raggio maggiore
  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.3 // Aumentato da 0.25 per più spazio al grafico
  const angleStep = (2 * Math.PI) / data.length

  // Disegna la griglia
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1

  // Cerchi concentrici
  for (let i = 1; i <= 5; i++) {
    const r = (radius * i) / 5
    ctx.beginPath()
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
    ctx.stroke()
  }

  // Linee radiali
  for (let i = 0; i < data.length; i++) {
    const angle = i * angleStep - Math.PI / 2
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  // Disegna le etichette delle categorie con font più grande
  ctx.fillStyle = '#000000'
  ctx.font = 'bold 16px Arial' // Font più grande e grassetto
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  data.forEach((item, index) => {
    const angle = index * angleStep - Math.PI / 2
    const labelRadius = radius + 40 // Più distanza dal centro
    const x = centerX + Math.cos(angle) * labelRadius
    const y = centerY + Math.sin(angle) * labelRadius

    // Etichette con emoji
    let label = item.category
    if (item.category === 'Environmental') label = '🌱 Environmental'
    else if (item.category === 'Social') label = '👥 Social'
    else if (item.category === 'Governance') label = '🏢 Governance'

    ctx.fillText(label, x, y)
  })

  // Funzione per disegnare poligono
  function drawPolygon(values: number[], color: string, fillOpacity: number, strokeWidth: number, dashArray?: number[]) {
    const points: Array<{x: number, y: number}> = []

    // Calcola i punti del poligono
    values.forEach((value, index) => {
      const angle = index * angleStep - Math.PI / 2
      const normalizedValue = Math.min(value, 100) / 100 // Normalizza a 0-1
      const r = radius * normalizedValue
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      points.push({ x, y })
    })

    // Disegna il riempimento
    if (fillOpacity > 0) {
      ctx.globalAlpha = fillOpacity
      ctx.fillStyle = color
      ctx.beginPath()
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y)
        else ctx.lineTo(point.x, point.y)
      })
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Disegna il contorno
    ctx.strokeStyle = color
    ctx.lineWidth = strokeWidth

    if (dashArray) {
      ctx.setLineDash(dashArray)
    } else {
      ctx.setLineDash([])
    }

    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.closePath()
    ctx.stroke()

    // Disegna i punti più grandi
    ctx.setLineDash([])
    points.forEach(point => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI) // Punti più grandi
      ctx.fillStyle = color
      ctx.fill()
      // Aggiungi bordo bianco ai punti per maggiore visibilità
      ctx.beginPath()
      ctx.arc(point.x, point.y, 4, 0, 2 * Math.PI)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }

  // Disegna i tre set di dati
  const companyValues = data.map(d => d.azienda)
  const sectorValues = data.map(d => d.settore)
  const nationalValues = data.map(d => d['PMI Italiane'])

  // PMI Italiane (sfondo)
  drawPolygon(nationalValues, '#f59e0b', 0.05, 2, [4, 4])

  // Media Settore
  drawPolygon(sectorValues, '#3b82f6', 0.1, 2, [8, 4])

  // La tua azienda (primo piano)
  drawPolygon(companyValues, '#16a34a', 0.3, 3)

  // Aggiungi etichette dei valori sulle linee radiali con font più leggibile
  ctx.fillStyle = '#666666'
  ctx.font = '12px Arial' // Font più grande
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'

  for (let i = 1; i <= 5; i++) {
    const value = (i * 20).toString()
    const x = centerX + 8 // Più distanza dal centro
    const y = centerY - (radius * i) / 5

    // Aggiungi sfondo bianco per maggiore leggibilità
    const textWidth = ctx.measureText(value).width
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(x - 2, y - 7, textWidth + 4, 14)

    ctx.fillStyle = '#666666'
    ctx.fillText(value, x, y)
  }

  return canvas
}

/**
 * Sostituisce un elemento SVG con un canvas equivalente
 */
export function replaceSVGWithCanvas(svgElement: SVGElement, canvasElement: HTMLCanvasElement): void {
  // Copia le dimensioni e lo stile
  const computedStyle = window.getComputedStyle(svgElement)
  canvasElement.style.width = computedStyle.width
  canvasElement.style.height = computedStyle.height
  canvasElement.style.display = computedStyle.display

  // Sostituisci l'elemento
  if (svgElement.parentNode) {
    svgElement.parentNode.replaceChild(canvasElement, svgElement)
  }
}