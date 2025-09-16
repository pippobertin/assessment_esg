import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { createRadarChartCanvas, replaceSVGWithCanvas } from './chart-to-canvas'

export interface PDFExportOptions {
  filename?: string
  format?: 'a4' | 'letter'
  orientation?: 'portrait' | 'landscape'
  margin?: number
  scale?: number
  benchmarkData?: Array<{
    category: string
    azienda: number
    settore: number
    'PMI Italiane': number
  }>
}

/**
 * Esporta due elementi HTML come PDF multi-pagina
 */
export async function exportTwoPagePDF(
  page1ElementId: string,
  page2ElementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'assessment-esg-report.pdf',
    format = 'a4',
    orientation = 'portrait',
    margin = 20,
    scale = 2
  } = options

  try {
    const page1Element = document.getElementById(page1ElementId)
    const page2Element = document.getElementById(page2ElementId)

    if (!page1Element) {
      throw new Error(`Element with id "${page1ElementId}" not found`)
    }
    if (!page2Element) {
      throw new Error(`Element with id "${page2ElementId}" not found`)
    }

    // Crea il PDF
    const pdfWidth = format === 'a4' ? 210 : 216
    const pdfHeight = format === 'a4' ? 297 : 279

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    })

    // Processa pagina 1
    await processPageElement(page1Element, pdf, options, pdfWidth, pdfHeight, margin, scale, 1, 2)

    // Aggiungi nuova pagina
    pdf.addPage()

    // Processa pagina 2
    await processPageElement(page2Element, pdf, options, pdfWidth, pdfHeight, margin, scale, 2, 2)

    // Aggiungi metadata
    pdf.setProperties({
      title: 'Report Assessment ESG',
      subject: 'Valutazione Sostenibilità Aziendale',
      author: 'ESG Assessment Tool',
      keywords: 'ESG, Sostenibilità, Environmental, Social, Governance',
      creator: 'ESG Assessment App'
    })

    // Scarica il PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Errore durante l\'esportazione PDF:', error)
    throw new Error(`Impossibile generare il PDF: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

async function processPageElement(
  element: HTMLElement,
  pdf: jsPDF,
  options: PDFExportOptions,
  pdfWidth: number,
  pdfHeight: number,
  margin: number,
  scale: number,
  pageNumber: number,
  totalPages: number
) {
  const rect = element.getBoundingClientRect()

  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: rect.width,
    height: rect.height,
    scrollX: 0,
    scrollY: 0,
    windowWidth: rect.width,
    windowHeight: rect.height,
    logging: false,
    removeContainer: true,
    // Aggiungi opzioni per bypassare il parsing CSS problematico
    ignoreElements: (element) => {
      return element.classList?.contains('pdf-hide') || false
    },
    // Forza html2canvas a non analizzare stili complessi
    foreignObjectRendering: false,
    onclone: (clonedDoc) => {
      // APPROCCIO BILANCIATO: Mantieni gli stili ma forza colori sicuri

      // Applica gli stessi fix di prima per i colori e SVG
      const buttonsToHide = clonedDoc.querySelectorAll('.pdf-hide')
      buttonsToHide.forEach(button => {
        if (button instanceof HTMLElement) {
          button.style.display = 'none'
        }
      })

      const body = clonedDoc.body
      body.style.width = `${rect.width}px`
      body.style.height = `${rect.height}px`
      body.style.overflow = 'hidden'

      // Stesso CSS override di prima
      const style = clonedDoc.createElement('style')
      style.textContent = `
        * {
          --color-primary: #16a34a !important;
          --color-blue: #2563eb !important;
          --color-purple: #9333ea !important;
          --color-green: #16a34a !important;
          --color-amber: #f59e0b !important;
          --color-yellow: #f59e0b !important;
          --color-orange: #ea580c !important;
          --color-red: #dc2626 !important;
          --color-gray: #6b7280 !important;
          color: #000000 !important;
          border-color: #e2e8f0 !important;
          background-color: #ffffff !important;
        }

        * {
          background-image: none !important;
          background: none !important;
        }

        /* Elimina completamente tutti i colori moderni non supportati */
        *[style*="lab("], *[style*="lch("], *[style*="oklab("], *[style*="oklch("] {
          color: #000000 !important;
          background-color: #ffffff !important;
          border-color: #e2e8f0 !important;
        }

        .bg-green-50 { background-color: #f0fdf4 !important; }
        .bg-blue-50 { background-color: #eff6ff !important; }
        .bg-gray-50 { background-color: #f9fafb !important; }
        .bg-amber-50 { background-color: #fffbeb !important; }
        .bg-yellow-50 { background-color: #fffbeb !important; }
        .bg-orange-50 { background-color: #fff7ed !important; }

        .text-green-600 { color: #16a34a !important; }
        .text-blue-600 { color: #2563eb !important; }
        .text-purple-600 { color: #9333ea !important; }
        .text-yellow-600 { color: #f59e0b !important; }
        .text-amber-600 { color: #f59e0b !important; }
        .text-orange-600 { color: #ea580c !important; }
        .text-red-600 { color: #dc2626 !important; }
      `
      clonedDoc.head.appendChild(style)

      // SVG replacement logic
      const svgElements = clonedDoc.querySelectorAll('svg')
      svgElements.forEach(svg => {
        const isRadarChart = svg.querySelector('.recharts-radar-polygon') !== null

        if (isRadarChart && options.benchmarkData) {
          const canvas = createRadarChartCanvas(options.benchmarkData, {
            width: 500,
            height: 400,
            backgroundColor: '#ffffff'
          })

          // Imposta dimensioni e centratura
          canvas.style.width = '100%'
          canvas.style.height = '400px'
          canvas.style.display = 'block'
          canvas.style.margin = '0 auto'
          canvas.style.maxWidth = '500px'

          // Crea un container per centrare meglio
          const container = clonedDoc.createElement('div')
          container.style.display = 'flex'
          container.style.justifyContent = 'center'
          container.style.alignItems = 'center'
          container.style.width = '100%'
          container.style.padding = '20px 0'
          container.appendChild(canvas)

          svg.parentNode?.replaceChild(container, svg)
        } else {
          const placeholder = clonedDoc.createElement('div')
          placeholder.style.width = svg.getAttribute('width') || '400px'
          placeholder.style.height = svg.getAttribute('height') || '300px'
          placeholder.style.backgroundColor = '#f9fafb'
          placeholder.style.border = '1px solid #e2e8f0'
          placeholder.style.display = 'flex'
          placeholder.style.alignItems = 'center'
          placeholder.style.justifyContent = 'center'
          placeholder.style.fontSize = '14px'
          placeholder.style.color = '#6b7280'
          placeholder.textContent = 'Grafico'

          svg.parentNode?.replaceChild(placeholder, svg)
        }
      })

      // PULIZIA SELETTIVA: Rimuovi solo colori problematici, mantieni il resto
      const allElements = clonedDoc.querySelectorAll('*')
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          // Pulisci solo gli attributi style che contengono colori problematici
          const currentStyle = el.getAttribute('style')
          if (currentStyle && (currentStyle.includes('lab(') || currentStyle.includes('lch(') ||
                              currentStyle.includes('oklab(') || currentStyle.includes('oklch('))) {
            // Pulisci solo le dichiarazioni problematiche, mantieni il resto
            const cleanStyle = currentStyle
              .replace(/[^;]*lab\([^)]*\)[^;]*(;|$)/g, '')
              .replace(/[^;]*lch\([^)]*\)[^;]*(;|$)/g, '')
              .replace(/[^;]*oklab\([^)]*\)[^;]*(;|$)/g, '')
              .replace(/[^;]*oklch\([^)]*\)[^;]*(;|$)/g, '')
            el.setAttribute('style', cleanStyle)
          }

          // Forza override solo per classi specifiche problematiche
          if (el.classList.contains('bg-green-50')) {
            el.style.setProperty('background-color', '#f0fdf4', 'important')
          }
          if (el.classList.contains('bg-blue-50')) {
            el.style.setProperty('background-color', '#eff6ff', 'important')
          }
          if (el.classList.contains('bg-gray-50')) {
            el.style.setProperty('background-color', '#f9fafb', 'important')
          }
          if (el.classList.contains('bg-amber-50') || el.classList.contains('bg-yellow-50')) {
            el.style.setProperty('background-color', '#fffbeb', 'important')
          }
          if (el.classList.contains('bg-orange-50')) {
            el.style.setProperty('background-color', '#fff7ed', 'important')
          }

          // Forza colori di testo sicuri
          if (el.classList.contains('text-green-600')) {
            el.style.setProperty('color', '#16a34a', 'important')
          }
          if (el.classList.contains('text-blue-600')) {
            el.style.setProperty('color', '#2563eb', 'important')
          }
          if (el.classList.contains('text-purple-600')) {
            el.style.setProperty('color', '#9333ea', 'important')
          }
          if (el.classList.contains('text-yellow-600') || el.classList.contains('text-amber-600')) {
            el.style.setProperty('color', '#f59e0b', 'important')
          }
          if (el.classList.contains('text-red-600')) {
            el.style.setProperty('color', '#dc2626', 'important')
          }
          if (el.classList.contains('text-orange-600')) {
            el.style.setProperty('color', '#ea580c', 'important')
          }

          // Rimuovi solo background-image problematici, mantieni il resto
          if (currentStyle && (currentStyle.includes('gradient') || currentStyle.includes('lab(') || currentStyle.includes('lch('))) {
            el.style.setProperty('background-image', 'none', 'important')
          }
        }
      })
    }
  })

  // Calcola le dimensioni per il PDF
  const imgWidth = pdfWidth - (margin * 2)
  const maxImgHeight = pdfHeight - (margin * 2) - 10 // Spazio per il numero pagina
  const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, maxImgHeight)

  // Per la pagina 2, allinea in alto invece di centrare
  let yPosition: number
  if (pageNumber === 2) {
    yPosition = margin // Allinea in alto per la pagina 2
  } else {
    // Centra verticalmente per la pagina 1
    yPosition = margin + (maxImgHeight - imgHeight) / 2
  }

  pdf.addImage(
    canvas.toDataURL('image/jpeg', 1.0),
    'JPEG',
    margin,
    yPosition,
    imgWidth,
    imgHeight
  )

  // Aggiungi numero pagina
  pdf.setFontSize(8)
  pdf.text(`Pagina ${pageNumber} di ${totalPages}`, pdfWidth - 30, pdfHeight - 10)
}

/**
 * Esporta un elemento HTML come PDF
 */
export async function exportToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'assessment-esg-report.pdf',
    format = 'a4',
    orientation = 'portrait',
    margin = 20,
    scale = 2
  } = options

  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`)
    }

    // Ottieni le dimensioni dell'elemento
    const rect = element.getBoundingClientRect()

    // Configura html2canvas per alta qualità e compatibilità colori
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: rect.width,
      height: rect.height,
      scrollX: 0,
      scrollY: 0,
      windowWidth: rect.width,
      windowHeight: rect.height,
      // Migliora la compatibilità con SVG e colori CSS moderni
      logging: false,
      removeContainer: true,
      ignoreElements: (element) => {
        // Ignora elementi con classe pdf-hide
        return element.classList?.contains('pdf-hide') || false
      },
      onclone: (clonedDoc) => {
        // Rimuovi elementi non necessari nel PDF
        const buttonsToHide = clonedDoc.querySelectorAll('.pdf-hide')
        buttonsToHide.forEach(button => {
          if (button instanceof HTMLElement) {
            button.style.display = 'none'
          }
        })

        // Ottimizza le dimensioni per il PDF
        const body = clonedDoc.body
        body.style.width = `${rect.width}px`
        body.style.height = `${rect.height}px`
        body.style.overflow = 'hidden'

        // APPROCCIO DRASTICO: Rimuovi tutte le variabili CSS custom e forza colori HEX
        const style = clonedDoc.createElement('style')
        style.textContent = `
          * {
            --color-primary: #16a34a !important;
            --color-blue: #2563eb !important;
            --color-purple: #9333ea !important;
            --color-green: #16a34a !important;
            --color-amber: #f59e0b !important;
            --color-yellow: #f59e0b !important;
            --color-orange: #ea580c !important;
            --color-red: #dc2626 !important;
            --color-gray: #6b7280 !important;
            color: #000000 !important;
            border-color: #e2e8f0 !important;
            background-color: #ffffff !important;
          }

          /* Rimuovi tutti i gradienti e background-image che causano problemi LAB */
          * {
            background-image: none !important;
            background: none !important;
          }

          /* Forza colori solidi per classi specifiche */
          .bg-green-50 { background-color: #f0fdf4 !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-amber-50 { background-color: #fffbeb !important; }
          .bg-yellow-50 { background-color: #fffbeb !important; }
          .bg-orange-50 { background-color: #fff7ed !important; }

          .text-green-600 { color: #16a34a !important; }
          .text-blue-600 { color: #2563eb !important; }
          .text-purple-600 { color: #9333ea !important; }
          .text-yellow-600 { color: #f59e0b !important; }
          .text-amber-600 { color: #f59e0b !important; }
          .text-orange-600 { color: #ea580c !important; }
          .text-red-600 { color: #dc2626 !important; }

          /* Page break controls per PDF */
          .page-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }
          .page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        `
        clonedDoc.head.appendChild(style)

        // Sostituisci grafici SVG con canvas per evitare problemi con LAB colors
        const svgElements = clonedDoc.querySelectorAll('svg')
        svgElements.forEach(svg => {
          // Verifica se è un grafico radar (contiene elementi specifici di Recharts)
          const isRadarChart = svg.querySelector('.recharts-radar-polygon') !== null

          if (isRadarChart && options.benchmarkData) {
            // Crea canvas con i dati del grafico
            const canvas = createRadarChartCanvas(options.benchmarkData, {
              width: 400,
              height: 300,
              backgroundColor: '#ffffff'
            })

            // Applica gli stili dell'SVG originale
            const svgRect = svg.getBoundingClientRect()
            canvas.style.width = `${svgRect.width}px`
            canvas.style.height = `${svgRect.height}px`
            canvas.style.display = 'block'
            canvas.style.margin = '0 auto'

            // Sostituisci l'SVG con il canvas
            svg.parentNode?.replaceChild(canvas, svg)
          } else {
            // Per altri SVG, crea un placeholder semplice
            const placeholder = clonedDoc.createElement('div')
            placeholder.style.width = svg.getAttribute('width') || '400px'
            placeholder.style.height = svg.getAttribute('height') || '300px'
            placeholder.style.backgroundColor = '#f9fafb'
            placeholder.style.border = '1px solid #e2e8f0'
            placeholder.style.display = 'flex'
            placeholder.style.alignItems = 'center'
            placeholder.style.justifyContent = 'center'
            placeholder.style.fontSize = '14px'
            placeholder.style.color = '#6b7280'
            placeholder.textContent = 'Grafico'

            svg.parentNode?.replaceChild(placeholder, svg)
          }
        })

        // Rimuovi tutti gli attributi di stile e class che potrebbero causare problemi
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach(el => {
          if (el instanceof HTMLElement) {
            // Rimuovi completamente l'attributo style e altri attributi problematici
            el.removeAttribute('style')

            // Rimuovi attributi che possono contenere gradienti o LAB colors
            const problematicAttrs = ['data-style', 'data-background', 'background', 'fill', 'stroke']
            problematicAttrs.forEach(attr => {
              if (el.hasAttribute(attr)) {
                el.removeAttribute(attr)
              }
            })

            // Forza stili di base solo per elementi di testo e background
            if (el.classList.contains('bg-green-50')) {
              el.style.setProperty('background-color', '#f0fdf4', 'important')
              el.style.setProperty('background-image', 'none', 'important')
            }
            if (el.classList.contains('bg-blue-50')) {
              el.style.setProperty('background-color', '#eff6ff', 'important')
              el.style.setProperty('background-image', 'none', 'important')
            }
            if (el.classList.contains('bg-gray-50')) {
              el.style.setProperty('background-color', '#f9fafb', 'important')
              el.style.setProperty('background-image', 'none', 'important')
            }

            // Forza colori di testo
            if (el.classList.contains('text-green-600')) {
              el.style.setProperty('color', '#16a34a', 'important')
            } else if (el.classList.contains('text-blue-600')) {
              el.style.setProperty('color', '#2563eb', 'important')
            } else if (el.classList.contains('text-purple-600')) {
              el.style.setProperty('color', '#9333ea', 'important')
            } else if (el.classList.contains('text-yellow-600') || el.classList.contains('text-amber-600')) {
              el.style.setProperty('color', '#f59e0b', 'important')
            } else if (el.classList.contains('text-red-600')) {
              el.style.setProperty('color', '#dc2626', 'important')
            } else if (el.classList.contains('text-orange-600')) {
              el.style.setProperty('color', '#ea580c', 'important')
            } else {
              // Forza colore di testo di default per elementi di testo
              if (el.textContent && el.textContent.trim().length > 0) {
                el.style.setProperty('color', '#000000', 'important')
              }
            }

            // Rimuovi tutti i background gradients
            el.style.setProperty('background-image', 'none', 'important')
            el.style.setProperty('background', 'none', 'important')
          }
        })
      }
    })

    // Dimensioni PDF in mm per A4
    const pdfWidth = format === 'a4' ? 210 : 216 // A4 vs Letter
    const pdfHeight = format === 'a4' ? 297 : 279

    // Calcola le dimensioni dell'immagine per il PDF
    const imgWidth = pdfWidth - (margin * 2)
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    // Crea il PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: format
    })

    // Cerca l'elemento che dovrebbe iniziare la seconda pagina
    const pageBreakElement = element.querySelector('.page-break-before')
    let splitPoint = 0.6 // Default split at 60% se non troviamo l'elemento

    if (pageBreakElement) {
      // Calcola la posizione dell'elemento page-break-before
      const elementRect = pageBreakElement.getBoundingClientRect()
      const containerRect = element.getBoundingClientRect()
      splitPoint = (elementRect.top - containerRect.top) / containerRect.height
    }

    // Dividi sempre in due pagine al punto specificato
    const firstPageHeight = imgHeight * splitPoint
    const secondPageHeight = imgHeight * (1 - splitPoint)

    // Prima pagina
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      margin,
      margin,
      imgWidth,
      firstPageHeight
    )

    // Aggiungi numero pagina
    pdf.setFontSize(8)
    pdf.text('Pagina 1 di 2', pdfWidth - 30, pdfHeight - 10)

    // Seconda pagina
    pdf.addPage()

    const secondPageYPosition = -firstPageHeight
    pdf.addImage(
      canvas.toDataURL('image/jpeg', 1.0),
      'JPEG',
      margin,
      margin + secondPageYPosition,
      imgWidth,
      imgHeight
    )

    // Numero pagina per la seconda pagina
    pdf.setFontSize(8)
    pdf.text('Pagina 2 di 2', pdfWidth - 30, pdfHeight - 10)

    // Aggiungi metadata al PDF
    pdf.setProperties({
      title: 'Report Assessment ESG',
      subject: 'Valutazione Sostenibilità Aziendale',
      author: 'ESG Assessment Tool',
      keywords: 'ESG, Sostenibilità, Environmental, Social, Governance',
      creator: 'ESG Assessment App'
    })

    // Scarica il PDF
    pdf.save(filename)
  } catch (error) {
    console.error('Errore durante l\'esportazione PDF:', error)
    throw new Error(`Impossibile generare il PDF: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
  }
}

/**
 * Genera un nome file PDF basato sui dati dell'azienda
 */
export function generatePDFFilename(
  companyName: string,
  date?: Date
): string {
  const cleanName = companyName
    .replace(/[^a-zA-Z0-9\s]/g, '') // Rimuovi caratteri speciali
    .replace(/\s+/g, '-') // Sostituisci spazi con trattini
    .toLowerCase()

  const dateStr = (date || new Date()).toISOString().split('T')[0] // YYYY-MM-DD

  return `assessment-esg-${cleanName}-${dateStr}.pdf`
}

/**
 * Prepara l'elemento per l'esportazione PDF
 */
export function preparePDFElement(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  // Aggiungi classe per nascondere elementi durante l'esportazione
  const elementsToHide = element.querySelectorAll('button, .pdf-hide')
  elementsToHide.forEach(el => {
    if (el instanceof HTMLElement) {
      el.classList.add('pdf-export-hidden')
    }
  })

  // Ottimizza le dimensioni dei grafici per il PDF
  const charts = element.querySelectorAll('.recharts-wrapper')
  charts.forEach(chart => {
    if (chart instanceof HTMLElement) {
      chart.style.minHeight = '300px'
    }
  })
}

/**
 * Ripristina l'elemento dopo l'esportazione PDF
 */
export function restorePDFElement(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  const hiddenElements = element.querySelectorAll('.pdf-export-hidden')
  hiddenElements.forEach(el => {
    if (el instanceof HTMLElement) {
      el.classList.remove('pdf-export-hidden')
    }
  })
}