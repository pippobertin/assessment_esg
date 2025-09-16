# TODO - ESG Assessment App

## ✅ Completato nella Sessione Precedente

### Sistema Base
- [x] Autenticazione utenti con Supabase
- [x] Database schema (users, companies_pcto, assessments)
- [x] 32 domande V-SME ESG categorizzate (Environmental, Social, Governance)
- [x] Sistema di scoring con pesi per categorie
- [x] Calcolo emissioni CO₂ con fattori italiani
- [x] Salvataggio automatico assessment in localStorage
- [x] Interfaccia wizard step-by-step per assessment

### Sistema Aziende
- [x] Censimento aziende con form completo
- [x] Selettore aziende con ricerca
- [x] Isolamento dati per utente (solo le proprie aziende)

### Assessment Multipli
- [x] Supporto assessment separati per ogni azienda
- [x] localStorage per azienda: `esg-assessment-{userId}-{companyId}`
- [x] Assessment Selector con lista completa assessment salvati
- [x] Progress tracking per ogni assessment
- [x] Eliminazione selettiva assessment salvati

### Risultati ESG
- [x] Componente completo risultati con punteggi per categoria
- [x] Visualizzazione emissioni CO₂ totali e breakdown per fonte
- [x] Badge performance (Eccellente, Buono, Sufficiente, Da migliorare)
- [x] Progress bar e statistiche completamento

### UX e Navigation
- [x] Dashboard con "I Miei Assessment" / "Inizia Nuovo Assessment"
- [x] Flusso completo: Dashboard → Assessment Selector → Resume/New → Results
- [x] Salvataggio automatico ogni 30s + ad ogni cambio risposta
- [x] Recovery automatico con ripresa da ultima posizione

## 🤖 Funzionalità AI da Implementare

### Riassunto Note con AI
- [ ] Integrazione API OpenAI o Claude per riassumere tutte le note dell'assessment
- [ ] Generazione di un testo di sintesi intelligente basato su tutte le note inserite
- [ ] Possibilità di personalizzare il prompt per diversi tipi di analisi

### Report e Grafici
- [ ] Creazione di report PDF/HTML con i risultati dell'assessment
- [ ] Implementazione di grafici interattivi per visualizzare:
  - Punteggi ESG per categoria (Environmental, Social, Governance)
  - Confronto con benchmark di settore
  - Evoluzione nel tempo (se multipli assessment)
  - Dettaglio emissioni CO₂ per fonte
- [ ] Dashboard con KPI principali
- [ ] Export dei dati in formati standard (CSV, Excel, PDF)

## 📊 Visualizzazioni Grafiche
- [ ] Grafici a torta per distribuzione punteggi ESG
- [ ] Grafici a barre per confronti
- [ ] Grafici a linee per trend temporali
- [ ] Radar chart per profilo ESG completo
- [ ] Infografiche per risultati principali

## 🎨 Design Report
- [ ] Template responsive per report
- [ ] Branding personalizzabile per scuole
- [ ] Sezioni: executive summary, dettagli, raccomandazioni
- [ ] Integrazione loghi e intestazioni

## 🔄 Miglioramenti Futuri
- [ ] Comparazione tra aziende dello stesso settore
- [ ] Suggerimenti automatici per miglioramenti
- [ ] Integrazione con database benchmark ESG
- [ ] Notifiche per scadenze e follow-up

## 📱 Mobile e UX
- [ ] Ottimizzazione mobile per studenti
- [ ] PWA per utilizzo offline
- [ ] Condivisione social dei risultati (opzionale)

## 🐛 Issues Risolte
- [x] Fix CO₂ calculations summing correctly instead of replacing
- [x] Fix notes field unique per question instead of shared
- [x] Fix assessment loading with proper company data
- [x] Fix localStorage multiple assessments support
- [x] Fix dashboard buttons logic for saved assessments

## 🎯 Prossimi Step Suggeriti
1. **Export PDF**: Implementare generazione PDF dei risultati
2. **AI Summary**: Integrare API AI per riassunto note
3. **Charts**: Aggiungere grafici interattivi (Chart.js o Recharts)
4. **Benchmark**: Sistema di confronto con medie settoriali
5. **Mobile UX**: Ottimizzazioni responsive per smartphone

## 📊 Architettura Attuale
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Supabase (Auth + Database)
- **State Management**: React Hooks + localStorage
- **Storage**: localStorage per drafts, Supabase per completed assessments
- **CO₂ Calculations**: Custom Italian emission factors
- **ESG Framework**: V-SME (Voluntary SME) with 32 questions