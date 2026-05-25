# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rahisa Bakery dashboard application — a Next.js 16 App Router project for sales tracking and demand prediction using Double Exponential Smoothing.

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router, TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives, Tailwind CSS v4)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: Sonner
- **Styling**: Tailwind v4 with CSS variables, custom `primary` color palette

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

### Route Groups

- `(auth)` — Public authentication routes (login page at `/login`)
- `(dashboard)` — Protected dashboard routes (`/dashboard`, `/sales`, `/predictions`, `/report`)

### Authentication

Auth is handled via two mechanisms:
- **Cookie** (`auth_token`): Set by login form, checked by route protection logic
- **localStorage** (`user_session`): Stores email, role, loginTime

Protected routes are defined in `lib/proxy.ts` (`PROTECTED_ROUTES` array).

### Prediction System (`app/(dashboard)/predictions/components/predictionUtils.ts`)

Uses **Double Exponential Smoothing (DES)** with grid search:
- Grid searches α and β from 0.1–0.9 (step 0.1)
- Optimizes for lowest MAPE (Mean Absolute Percentage Error)
- Returns forecasts, levels, trends, best parameters, and next period prediction
- If forecast < 0, clamps to 0

### UI Components

shadcn/ui components are in `components/ui/`. Custom components:
- `components/forms/LoginForm.tsx` — Login form with validation
- `components/dashboard/Sidebar.tsx` — Dashboard navigation with logout
- `components/ui/chart.tsx` — Recharts-based chart wrapper
- `app/(dashboard)/predictions/components/` — Prediction-specific UI (PredictionChart, PredictionTable, PredictionCard, PredictionMetrics)

### Styling

Tailwind v4 reads from `app/globals.css`. Custom primary color palette defined via CSS variables.

## Document Handling

### PDF Generation (for reports)

Use `@react-pdf/renderer` for React-based PDF generation:

```bash
npm install @react-pdf/renderer
```

Key pattern — create PDF as React components:
```tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Define styles
const styles = StyleSheet.create({ ... });

// PDF document as component
const MyDocument = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View><Text>Sales Report</Text></View>
    </Page>
  </Document>
);

// Render to blob and trigger download
import { pdf } from '@react-pdf/renderer';
const blob = await pdf(<MyDocument />).toBlob();
// Use url.createObjectURL(blob) and <a download> to trigger
```

For simpler use cases, `jspdf` is lighter:
```bash
npm install jspdf
```

### DOCX Parsing (for uploads)

Use `mammoth` for converting DOCX to HTML/text:

```bash
npm install mammoth
```

```tsx
import mammoth from 'mammoth';

const result = await mammoth.extractRawText({ arrayBuffer: fileBuffer });
// result.value contains the text content
```

For better formatting preservation:
```tsx
const result = await mammoth.convertToHtml({ arrayBuffer: fileBuffer });
// result.value contains HTML — sanitize with DOMPurify before rendering
```

### PDF Parsing (for uploads)

Use `pdfjs-dist` for client-side PDF text extraction:

```bash
npm install pdfjs-dist
```

```tsx
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const doc = await pdfjsLib.getDocument(arrayBuffer).promise;
const text = await doc.getPage(1).then(page => page.getTextContent());
// text.items contains text blocks with str, x, y coordinates
```

For Node.js/server-side, `pdf-parse` is simpler:
```bash
npm install pdf-parse
```

## Key Files

- `app/layout.tsx` — Root layout with font configuration
- `app/(dashboard)/layout.tsx` — Dashboard layout with Sidebar and Toaster
- `lib/proxy.ts` — Protected route definitions and auth cookie constants
- `lib/utils.ts` — `cn()` utility for Tailwind class merging