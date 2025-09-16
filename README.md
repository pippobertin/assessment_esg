# ESG Assessment App per PCTO

Una web application moderna per permettere agli studenti delle scuole superiori di condurre assessment ESG presso le aziende durante i percorsi PCTO.

## Caratteristiche principali

- **Assessment ESG completo**: Basato sullo standard ESRS V-SME ed. 2024
- **Interfaccia user-friendly**: Progettata per studenti di 17-18 anni
- **Calcolatori di emissioni**: Conversioni automatiche in tCO₂eq per le metriche ambientali
- **Integrazione Supabase**: Gestione utenti, anagrafiche e salvataggio dati
- **Design moderno**: Realizzata con Next.js, TypeScript e Tailwind CSS

## Tecnologie utilizzate

- **Next.js 15** - Framework React con App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling moderno e responsivo
- **Supabase** - Database e autenticazione
- **React Hook Form + Zod** - Gestione form e validazione
- **Radix UI** - Componenti accessibili
- **Framer Motion** - Animazioni fluide
- **Lucide React** - Icone

## Setup iniziale

### 1. Configurazione Supabase

Aggiorna il file `.env.local` con le tue credenziali Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Struttura del database

Crea le seguenti tabelle in Supabase:

```sql
-- Tabella utenti (studenti)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school TEXT NOT NULL,
  grade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella aziende
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  size TEXT CHECK (size IN ('small', 'medium', 'large')) NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella assessment
CREATE TABLE assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('draft', 'in_progress', 'completed')) DEFAULT 'draft',
  environmental_score DECIMAL,
  social_score DECIMAL,
  governance_score DECIMAL,
  overall_score DECIMAL,
  responses JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Installazione dipendenze

```bash
npm install
```

### 4. Avvio development server

```bash
npm run dev
```

## Struttura del progetto

```
src/
├── app/                    # App Router (Next.js 13+)
├── components/
│   ├── ui/                # Componenti UI riutilizzabili
│   └── esg/               # Componenti specifici ESG
├── lib/
│   └── supabase.ts        # Client Supabase
├── types/
│   └── esg.ts             # Definizioni TypeScript
├── utils/
│   └── co2-calculators.ts # Calcolatori emissioni CO₂
├── hooks/                 # Custom React hooks
└── data/                  # Dati statici e configurazioni
```

## Prossimi step

1. Definire le domande dell'assessment basate su ESRS V-SME
2. Creare i componenti per le diverse sezioni ESG
3. Implementare i dashboard per visualizzare i risultati
4. Aggiungere funzionalità di export dei report
5. Testing e ottimizzazioni

## Contributi

Questo progetto è sviluppato per scopi educativi nel contesto dei percorsi PCTO.
