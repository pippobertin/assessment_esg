import { ESGQuestion } from '@/types/esg'

export const environmentalQuestions: ESGQuestion[] = [
  // ESRS E1 - Cambiamenti Climatici
  {
    id: 'E1_01',
    category: 'environmental',
    subcategory: 'Energia e Emissioni',
    question: 'L\'azienda utilizza principalmente energia elettrica da fonti rinnovabili?',
    type: 'multiple_choice',
    options: ['Sì, oltre 80%', 'Parzialmente (30-80%)', 'Poco (10-30%)', 'No, meno del 10%', 'Non so'],
    required: true,
    weight: 3,
    description: 'Valuta la transizione verso energie pulite'
  },
  {
    id: 'E1_02',
    category: 'environmental',
    subcategory: 'Energia e Emissioni',
    question: 'Consumo annuale di energia elettrica (kWh)',
    type: 'calculator',
    required: true,
    weight: 2,
    description: 'Inserisci il consumo per calcolare le emissioni di CO₂'
  },
  {
    id: 'E1_03',
    category: 'environmental',
    subcategory: 'Energia e Emissioni',
    question: 'Consumo annuale di gas naturale (m³)',
    type: 'calculator',
    required: false,
    weight: 2,
    description: 'Se applicabile, per calcolare le emissioni'
  },
  {
    id: 'E1_04',
    category: 'environmental',
    subcategory: 'Energia e Emissioni',
    question: 'L\'azienda monitora e registra le proprie emissioni di gas serra?',
    type: 'multiple_choice',
    options: ['Sì, con dettaglio Scope 1,2,3', 'Sì, parzialmente', 'No, ma ha intenzione di farlo', 'No'],
    required: true,
    weight: 3,
    description: 'Monitoraggio delle emissioni secondo standard GHG Protocol'
  },
  {
    id: 'E1_05',
    category: 'environmental',
    subcategory: 'Energia e Emissioni',
    question: 'Ha implementato misure per ridurre il consumo energetico?',
    type: 'multiple_choice',
    options: ['Sì, con obiettivi quantificati', 'Sì, alcune misure', 'In programma', 'No'],
    required: true,
    weight: 2,
    description: 'Efficienza energetica e riduzione consumi'
  },

  // ESRS E2 - Inquinamento
  {
    id: 'E2_01',
    category: 'environmental',
    subcategory: 'Inquinamento e Rifiuti',
    question: 'L\'azienda ha implementato misure per ridurre i rifiuti?',
    type: 'multiple_choice',
    options: ['Sì, con obiettivi di riduzione', 'Sì, raccolta differenziata', 'Parzialmente', 'No'],
    required: true,
    weight: 2,
    description: 'Gestione sostenibile dei rifiuti'
  },
  {
    id: 'E2_02',
    category: 'environmental',
    subcategory: 'Inquinamento e Rifiuti',
    question: 'Quantità annuale di rifiuti prodotti (kg)',
    type: 'number',
    required: false,
    weight: 1,
    description: 'Stima dei rifiuti totali prodotti'
  },
  {
    id: 'E2_03',
    category: 'environmental',
    subcategory: 'Inquinamento e Rifiuti',
    question: 'L\'azienda utilizza sostanze chimiche pericolose nei suoi processi?',
    type: 'multiple_choice',
    options: ['No', 'Sì, ma con protocolli di sicurezza rigorosi', 'Sì, con misure di sicurezza base', 'Non so'],
    required: true,
    weight: 2,
    description: 'Gestione di sostanze potenzialmente inquinanti'
  },

  // ESRS E3 - Risorse Idriche e Marine
  {
    id: 'E3_01',
    category: 'environmental',
    subcategory: 'Acqua',
    question: 'Consumo annuale di acqua (m³)',
    type: 'calculator',
    required: false,
    weight: 1,
    description: 'Per calcolare l\'impatto idrico e le emissioni correlate'
  },
  {
    id: 'E3_02',
    category: 'environmental',
    subcategory: 'Acqua',
    question: 'L\'azienda ha implementato misure per il risparmio idrico?',
    type: 'multiple_choice',
    options: ['Sì, con sistemi di recupero', 'Sì, misure di efficienza', 'In programma', 'No'],
    required: true,
    weight: 2,
    description: 'Gestione sostenibile delle risorse idriche'
  },

  // ESRS E4 - Biodiversità ed Ecosistemi  
  {
    id: 'E4_01',
    category: 'environmental',
    subcategory: 'Biodiversità',
    question: 'L\'azienda si trova in aree di particolare valore naturalistico?',
    type: 'multiple_choice',
    options: ['No', 'Sì, ma non impatta l\'ambiente', 'Sì, con misure di protezione', 'Non so'],
    required: true,
    weight: 2,
    description: 'Impatto su biodiversità e ecosistemi locali'
  },

  // ESRS E5 - Economia Circolare
  {
    id: 'E5_01',
    category: 'environmental',
    subcategory: 'Economia Circolare',
    question: 'L\'azienda applica principi di economia circolare?',
    type: 'multiple_choice',
    options: ['Sì, strategia definita', 'Sì, alcune iniziative', 'In valutazione', 'No'],
    required: true,
    weight: 2,
    description: 'Riutilizzo, riciclo, riduzione sprechi'
  },
  {
    id: 'E5_02',
    category: 'environmental',
    subcategory: 'Economia Circolare',
    question: 'Percentuale di materiali riciclati utilizzati nei prodotti/servizi',
    type: 'multiple_choice',
    options: ['Oltre 50%', '20-50%', '5-20%', 'Meno del 5%', 'Non applicabile'],
    required: false,
    weight: 1,
    description: 'Utilizzo di materiali da fonti circolari'
  }
]

export const socialQuestions: ESGQuestion[] = [
  // ESRS S1 - Forza Lavoro
  {
    id: 'S1_01',
    category: 'social',
    subcategory: 'Condizioni di Lavoro',
    question: 'Tutti i dipendenti hanno un contratto regolare?',
    type: 'multiple_choice',
    options: ['Sì, tutti', 'Sì, la maggior parte', 'Parzialmente', 'No'],
    required: true,
    weight: 3,
    description: 'Regolarità contrattuale e diritti dei lavoratori'
  },
  {
    id: 'S1_02',
    category: 'social',
    subcategory: 'Condizioni di Lavoro',
    question: 'L\'azienda offre programmi di formazione ai dipendenti?',
    type: 'multiple_choice',
    options: ['Sì, programmi strutturati', 'Sì, formazione occasionale', 'Pianificati per il futuro', 'No'],
    required: true,
    weight: 2,
    description: 'Sviluppo professionale e competenze'
  },
  {
    id: 'S1_03',
    category: 'social',
    subcategory: 'Sicurezza sul Lavoro',
    question: 'L\'azienda ha implementato misure di sicurezza sul lavoro?',
    type: 'multiple_choice',
    options: ['Sì, protocolli completi', 'Sì, misure di base', 'In fase di implementazione', 'No'],
    required: true,
    weight: 3,
    description: 'Protezione salute e sicurezza lavoratori'
  },
  {
    id: 'S1_04',
    category: 'social',
    subcategory: 'Diversità e Inclusione',
    question: 'L\'azienda promuove la diversità e l\'inclusione?',
    type: 'multiple_choice',
    options: ['Sì, con politiche attive', 'Sì, ma informalmente', 'In via di sviluppo', 'No'],
    required: true,
    weight: 2,
    description: 'Parità di opportunità e non discriminazione'
  },
  {
    id: 'S1_05',
    category: 'social',
    subcategory: 'Diversità e Inclusione',
    question: 'Percentuale approssimativa di donne in posizioni dirigenziali',
    type: 'multiple_choice',
    options: ['Oltre 40%', '20-40%', '10-20%', 'Meno del 10%', 'Non applicabile/Non so'],
    required: false,
    weight: 1,
    description: 'Equilibrio di genere nella leadership'
  },

  // ESRS S2 - Lavoratori nella Catena di Valore
  {
    id: 'S2_01',
    category: 'social',
    subcategory: 'Catena di Fornitura',
    question: 'L\'azienda verifica le pratiche lavorative dei suoi fornitori?',
    type: 'multiple_choice',
    options: ['Sì, con audit regolari', 'Sì, verifiche occasionali', 'Solo per fornitori principali', 'No'],
    required: true,
    weight: 2,
    description: 'Responsabilità sociale lungo la supply chain'
  },

  // ESRS S3 - Comunità Locali
  {
    id: 'S3_01',
    category: 'social',
    subcategory: 'Impatto Territoriale',
    question: 'L\'azienda contribuisce allo sviluppo della comunità locale?',
    type: 'multiple_choice',
    options: ['Sì, con progetti strutturati', 'Sì, supporto occasionale', 'In programma', 'No'],
    required: true,
    weight: 2,
    description: 'Coinvolgimento e supporto al territorio'
  },
  {
    id: 'S3_02',
    category: 'social',
    subcategory: 'Impatto Territoriale',
    question: 'L\'azienda assume prevalentemente personale locale?',
    type: 'multiple_choice',
    options: ['Sì, oltre 80%', 'Sì, 50-80%', 'Parzialmente', 'No'],
    required: true,
    weight: 1,
    description: 'Contributo all\'economia locale'
  },

  // ESRS S4 - Consumatori e Utenti Finali
  {
    id: 'S4_01',
    category: 'social',
    subcategory: 'Qualità e Sicurezza',
    question: 'L\'azienda ha procedure per garantire la qualità/sicurezza dei prodotti/servizi?',
    type: 'multiple_choice',
    options: ['Sì, con certificazioni', 'Sì, controlli interni', 'Controlli di base', 'No'],
    required: true,
    weight: 2,
    description: 'Protezione e soddisfazione del cliente'
  },
  {
    id: 'S4_02',
    category: 'social',
    subcategory: 'Qualità e Sicurezza',
    question: 'L\'azienda ha un sistema per gestire reclami e feedback dei clienti?',
    type: 'multiple_choice',
    options: ['Sì', 'No'],
    required: true,
    weight: 1,
    description: 'Ascolto e miglioramento continuo'
  }
]

export const governanceQuestions: ESGQuestion[] = [
  // ESRS G1 - Condotta Aziendale
  {
    id: 'G1_01',
    category: 'governance',
    subcategory: 'Etica e Trasparenza',
    question: 'L\'azienda ha un codice etico o di condotta definito?',
    type: 'multiple_choice',
    options: ['Sì', 'No'],
    required: true,
    weight: 2,
    description: 'Principi etici e di integrità aziendale'
  },
  {
    id: 'G1_02',
    category: 'governance',
    subcategory: 'Etica e Trasparenza',
    question: 'L\'azienda ha procedure anti-corruzione?',
    type: 'multiple_choice',
    options: ['Sì, procedure formali', 'Sì, linee guida informali', 'In sviluppo', 'No'],
    required: true,
    weight: 2,
    description: 'Prevenzione corruzione e conflitti di interesse'
  },
  {
    id: 'G1_03',
    category: 'governance',
    subcategory: 'Compliance',
    question: 'L\'azienda rispetta tutte le normative applicabili?',
    type: 'multiple_choice',
    options: ['Sì, con monitoraggio attivo', 'Sì, rispetto delle principali', 'Generalmente sì', 'Non so'],
    required: true,
    weight: 3,
    description: 'Conformità normativa e legale'
  },
  {
    id: 'G1_04',
    category: 'governance',
    subcategory: 'Trasparenza',
    question: 'L\'azienda pubblica informazioni sulla propria sostenibilità?',
    type: 'multiple_choice',
    options: ['Sì, report dettagliati', 'Sì, informazioni di base', 'Solo su richiesta', 'No'],
    required: true,
    weight: 2,
    description: 'Comunicazione e accountability'
  },
  {
    id: 'G1_05',
    category: 'governance',
    subcategory: 'Gestione Rischi',
    question: 'L\'azienda ha identificato i principali rischi ESG per il suo business?',
    type: 'multiple_choice',
    options: ['Sì, con piano di mitigazione', 'Sì, identificazione di base', 'In valutazione', 'No'],
    required: true,
    weight: 2,
    description: 'Gestione proattiva dei rischi sostenibilità'
  },
  {
    id: 'G1_06',
    category: 'governance',
    subcategory: 'Stakeholder',
    question: 'L\'azienda coinvolge regolarmente gli stakeholder nelle decisioni?',
    type: 'multiple_choice',
    options: ['Sì, processi strutturati', 'Sì, consultazioni occasionali', 'Solo stakeholder chiave', 'No'],
    required: true,
    weight: 2,
    description: 'Engagement e dialogo con parti interessate'
  },
  {
    id: 'G1_07',
    category: 'governance',
    subcategory: 'Governance',
    question: 'La governance aziendale include competenze in sostenibilità?',
    type: 'multiple_choice',
    options: ['Sì, ruoli specifici', 'Sì, come parte delle responsabilità', 'In fase di integrazione', 'No'],
    required: true,
    weight: 2,
    description: 'Integrazione ESG nella leadership'
  },
  {
    id: 'G1_08',
    category: 'governance',
    subcategory: 'Privacy',
    question: 'L\'azienda protegge adeguatamente i dati personali (GDPR)?',
    type: 'multiple_choice',
    options: ['Sì, piena conformità', 'Sì, misure di base', 'In adeguamento', 'Non applicabile'],
    required: true,
    weight: 2,
    description: 'Protezione dati e privacy'
  }
]

export const allQuestions: ESGQuestion[] = [
  ...environmentalQuestions,
  ...socialQuestions,
  ...governanceQuestions
]