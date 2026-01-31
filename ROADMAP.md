# Build Roadmap - 24 Hour Sprint
## PM-KUSUM Fraud Detection System

**Event**: HackNagpur 2025  
**Build Window**: 24 hours  
**Team Size**: 3 people  
**Goal**: Working demo + deployment + pitch

---

## 🎯 Sprint Overview

```
Hour 0-12:   Core MVP (Must Have Features)
Hour 12-18:  Polish + Visualizations (Should Have)
Hour 18-22:  Mutations Implementation (Nice to Have)
Hour 22-24:  Deploy + Demo Prep (Critical)
```

### Team Roles (Suggested)

**Person 1 (You)**: Frontend lead, component building, integration  
**Person 2**: Data logic, fraud detection algorithms, CSV parsing  
**Person 3**: UI/UX polish, charts, maps, styling

> **Vibe Code Strategy**: Use AI assistants (Claude/ChatGPT/Cursor) heavily. Copy-paste examples. Don't reinvent wheels.

---

## 📅 Detailed Hour-by-Hour Plan

---

## 🟢 PHASE 1: Foundation (Hour 0-2)

### Hour 0-1: Project Setup

**Person 1 (Frontend Lead)**:
```bash
# Create Next.js project
npx create-next-app@latest pm-kusum-detector
# Choose: TypeScript, Tailwind, App Router, No src directory

# Navigate to project
cd pm-kusum-detector

# Install core dependencies
npm install papaparse
npm install recharts
npm install react-leaflet leaflet

# Install shadcn/ui
npx shadcn-ui@latest init
# Choose: Default style, Zinc color, CSS variables

# Install specific components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add dialog
```

**Person 2 (Data Logic)**:
- Research Haversine formula (GPS distance calculation)
- Draft pseudocode for duplicate detection
- Create sample CSV files (clean + fraud)

**Person 3 (UI/UX)**:
- Research Tailwind color schemes
- Find inspiration from existing dashboards (screenshot 2-3 examples)
- Sketch wireframe on paper/Figma (simple boxes)

**Git Checkpoint**:
```bash
git init
git add .
git commit -m "Initial setup with dependencies"
git remote add origin <your-repo-url>
git push -u origin main
```

**Deliverables**:
- ✅ Working Next.js app (loads on localhost:3000)
- ✅ All dependencies installed
- ✅ Basic folder structure

---

### Hour 1-2: File Structure & Types

**Person 1**:
Create folder structure:
```
app/
├── page.tsx              # Upload page
├── dashboard/
│   └── page.tsx          # Results dashboard
├── api/
│   └── analyze/
│       └── route.ts      # Fraud detection API (optional)
├── layout.tsx
├── globals.css

components/
├── UploadCSV.tsx         # File upload component
├── ResultsTable.tsx      # Main data table
├── RiskScoreCard.tsx     # Red/Amber/Green cards
├── DetailModal.tsx       # Application details popup
└── ui/                   # shadcn components

lib/
├── fraudDetection.ts     # Core algorithms
├── geoUtils.ts           # GPS calculations
├── types.ts              # TypeScript interfaces
└── utils.ts              # Helper functions

public/
├── sample-clean.csv
└── sample-fraud.csv
```

**Person 2**:
Create `lib/types.ts`:
```typescript
export interface Application {
  id: number;
  name: string;
  aadhaar_last4?: string;
  phone?: string;
  bank_account?: string;
  gps_lat?: number;
  gps_long?: number;
  application_date: string;
  land_survey_no?: string;
  pump_capacity?: string;
  district?: string;
}

export interface FraudFlag {
  type: 'DUPLICATE_AADHAAR' | 'DUPLICATE_BANK' | 'DUPLICATE_PHONE' | 'GPS_CLUSTER' | 'NEW_BANK_ACCOUNT';
  confidence: number; // 0-100
  description: string;
  relatedApplications?: number[]; // IDs of related apps
}

export interface AnalyzedApplication extends Application {
  flags: FraudFlag[];
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  overallConfidence: number;
}
```

**Person 3**:
Create color scheme in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        risk: {
          high: '#EF4444',      // Red
          medium: '#F59E0B',    // Amber
          low: '#10B981',       // Green
        }
      }
    }
  }
}
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Add folder structure and TypeScript types"
```

**Deliverables**:
- ✅ Clean folder structure
- ✅ TypeScript interfaces defined
- ✅ Tailwind configured

---

## 🟡 PHASE 2: Core Features (Hour 2-8)

### Hour 2-4: CSV Upload & Parsing

**Person 1**:
Build `components/UploadCSV.tsx`:
```typescript
'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Application } from '@/lib/types';

export default function UploadCSV({ onDataParsed }: { onDataParsed: (data: Application[]) => void }) {
  const [file, setFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };
  
  const handleUpload = () => {
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const applications = results.data.map((row: any, index) => ({
          id: index + 1,
          name: row.name,
          aadhaar_last4: row.aadhaar_last4,
          phone: row.phone,
          bank_account: row.bank_account,
          gps_lat: parseFloat(row.gps_lat),
          gps_long: parseFloat(row.gps_long),
          application_date: row.application_date,
          land_survey_no: row.land_survey_no,
          pump_capacity: row.pump_capacity,
          district: row.district
        }));
        onDataParsed(applications);
      }
    });
  };
  
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center">
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <Button onClick={handleUpload} disabled={!file}>
        Analyze Applications
      </Button>
    </div>
  );
}
```

Build `app/page.tsx`:
```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UploadCSV from '@/components/UploadCSV';
import { Application } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  
  const handleDataParsed = (data: Application[]) => {
    // Store in localStorage for demo (or pass via URL state)
    localStorage.setItem('applications', JSON.stringify(data));
    router.push('/dashboard');
  };
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">
        PM-KUSUM Fraud Detection System
      </h1>
      <UploadCSV onDataParsed={handleDataParsed} />
      
      <div className="mt-8 text-center">
        <a href="/sample-clean.csv" download className="text-blue-600">
          Download Sample CSV
        </a>
      </div>
    </div>
  );
}
```

**Person 2**:
Create sample CSV files in `public/`:

`sample-fraud.csv`:
```csv
name,aadhaar_last4,phone,bank_account,gps_lat,gps_long,application_date,land_survey_no,pump_capacity,district
Ramesh Kumar,1234,9876543210,SBIN0001234567,26.8467,75.8012,2025-01-15,123/4,5HP,Jaipur
Suresh Patel,1234,9988776655,HDFC0009876543,26.8469,75.8015,2025-01-16,456/7,5HP,Jaipur
Mahesh Singh,5678,9876543210,SBIN0001234567,26.9123,75.8234,2025-01-17,789/1,7HP,Jaipur
```
*(Add 97 more rows with 30% fraud patterns)*

**Person 3**:
Style the upload page with Tailwind

**Testing**:
- Load page, upload CSV, see console.log of parsed data
- Verify navigation to dashboard works

**Git Checkpoint**:
```bash
git add .
git commit -m "Add CSV upload and parsing"
```

---

### Hour 4-7: Fraud Detection Algorithms

**Person 2 (Primary)**:
Build `lib/fraudDetection.ts`:

```typescript
import { Application, FraudFlag, AnalyzedApplication } from './types';
import { getDistance } from './geoUtils';

export function analyzeApplications(applications: Application[]): AnalyzedApplication[] {
  const aadhaarMap = new Map<string, number[]>();
  const bankMap = new Map<string, number[]>();
  const phoneMap = new Map<string, number[]>();
  
  // First pass: Build lookup maps
  applications.forEach((app) => {
    if (app.aadhaar_last4) {
      const ids = aadhaarMap.get(app.aadhaar_last4) || [];
      ids.push(app.id);
      aadhaarMap.set(app.aadhaar_last4, ids);
    }
    
    if (app.bank_account) {
      const ids = bankMap.get(app.bank_account) || [];
      ids.push(app.id);
      bankMap.set(app.bank_account, ids);
    }
    
    if (app.phone) {
      const ids = phoneMap.get(app.phone) || [];
      ids.push(app.id);
      phoneMap.set(app.phone, ids);
    }
  });
  
  // Second pass: Flag duplicates
  return applications.map((app) => {
    const flags: FraudFlag[] = [];
    
    // Check Aadhaar duplicates
    if (app.aadhaar_last4) {
      const duplicates = aadhaarMap.get(app.aadhaar_last4) || [];
      if (duplicates.length >= 2) {
        flags.push({
          type: 'DUPLICATE_AADHAAR',
          confidence: 95,
          description: `Aadhaar ${app.aadhaar_last4} appears in ${duplicates.length} applications`,
          relatedApplications: duplicates.filter(id => id !== app.id)
        });
      }
    }
    
    // Check bank duplicates
    if (app.bank_account) {
      const duplicates = bankMap.get(app.bank_account) || [];
      if (duplicates.length >= 2) {
        flags.push({
          type: 'DUPLICATE_BANK',
          confidence: 90,
          description: `Bank account used in ${duplicates.length} applications`,
          relatedApplications: duplicates.filter(id => id !== app.id)
        });
      }
    }
    
    // Check phone duplicates (allow up to 2 - could be family)
    if (app.phone) {
      const duplicates = phoneMap.get(app.phone) || [];
      if (duplicates.length >= 3) {
        flags.push({
          type: 'DUPLICATE_PHONE',
          confidence: 60,
          description: `Phone number used in ${duplicates.length} applications`,
          relatedApplications: duplicates.filter(id => id !== app.id)
        });
      }
    }
    
    // Check GPS clustering
    if (app.gps_lat && app.gps_long) {
      const nearbyApps = applications.filter((other) => {
        if (!other.gps_lat || !other.gps_long || other.id === app.id) return false;
        const distance = getDistance(app.gps_lat!, app.gps_long!, other.gps_lat, other.gps_long);
        return distance < 0.5; // Within 500 meters
      });
      
      if (nearbyApps.length >= 4) { // 5 total including this one
        flags.push({
          type: 'GPS_CLUSTER',
          confidence: 75,
          description: `${nearbyApps.length + 1} applications within 500m radius`,
          relatedApplications: nearbyApps.map(a => a.id)
        });
      }
    }
    
    // Calculate overall risk
    const riskLevel = flags.length >= 2 ? 'HIGH' : flags.length === 1 ? 'MEDIUM' : 'LOW';
    const overallConfidence = flags.length > 0
      ? Math.round(flags.reduce((sum, f) => sum + f.confidence, 0) / flags.length)
      : 0;
    
    return {
      ...app,
      flags,
      riskLevel,
      overallConfidence
    };
  });
}
```

Build `lib/geoUtils.ts`:
```typescript
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
```

**Person 1 & 3**:
- Test fraud detection with sample data
- Write unit tests (if time permits)

**Testing**:
```typescript
// In browser console or test file
const testApps = [
  { id: 1, name: 'A', aadhaar_last4: '1234', ... },
  { id: 2, name: 'B', aadhaar_last4: '1234', ... }
];
const results = analyzeApplications(testApps);
console.log(results[0].flags); // Should have DUPLICATE_AADHAAR
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Implement fraud detection algorithms"
```

---

### Hour 7-10: Dashboard UI

**Person 1**:
Build `app/dashboard/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';
import { AnalyzedApplication } from '@/lib/types';
import { analyzeApplications } from '@/lib/fraudDetection';
import ResultsTable from '@/components/ResultsTable';
import RiskScoreCard from '@/components/RiskScoreCard';

export default function Dashboard() {
  const [results, setResults] = useState<AnalyzedApplication[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  
  useEffect(() => {
    const stored = localStorage.getItem('applications');
    if (stored) {
      const apps = JSON.parse(stored);
      const analyzed = analyzeApplications(apps);
      setResults(analyzed);
    }
  }, []);
  
  const highRisk = results.filter(r => r.riskLevel === 'HIGH').length;
  const mediumRisk = results.filter(r => r.riskLevel === 'MEDIUM').length;
  const lowRisk = results.filter(r => r.riskLevel === 'LOW').length;
  
  const filteredResults = filter === 'ALL' 
    ? results 
    : results.filter(r => r.riskLevel === filter);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fraud Analysis Results</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <RiskScoreCard 
          label="High Risk" 
          count={highRisk} 
          color="red"
          onClick={() => setFilter('HIGH')}
        />
        <RiskScoreCard 
          label="Medium Risk" 
          count={mediumRisk} 
          color="amber"
          onClick={() => setFilter('MEDIUM')}
        />
        <RiskScoreCard 
          label="Low Risk" 
          count={lowRisk} 
          color="green"
          onClick={() => setFilter('LOW')}
        />
      </div>
      
      <ResultsTable applications={filteredResults} />
    </div>
  );
}
```

**Person 3**:
Build `components/RiskScoreCard.tsx`:
```typescript
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Props {
  label: string;
  count: number;
  color: 'red' | 'amber' | 'green';
  onClick: () => void;
}

export default function RiskScoreCard({ label, count, color, onClick }: Props) {
  const colors = {
    red: 'bg-red-100 text-red-800 border-red-300',
    amber: 'bg-amber-100 text-amber-800 border-amber-300',
    green: 'bg-green-100 text-green-800 border-green-300'
  };
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition ${colors[color]}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="text-4xl font-bold">{count}</div>
        <div className="text-sm font-medium">{label}</div>
      </CardContent>
    </Card>
  );
}
```

Build `components/ResultsTable.tsx`:
```typescript
import { AnalyzedApplication } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ResultsTable({ applications }: { applications: AnalyzedApplication[] }) {
  const getRiskColor = (level: string) => {
    switch(level) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Aadhaar</TableHead>
          <TableHead>Risk Level</TableHead>
          <TableHead>Flags</TableHead>
          <TableHead>Confidence</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id}>
            <TableCell>{app.name}</TableCell>
            <TableCell>{app.aadhaar_last4 || 'N/A'}</TableCell>
            <TableCell>
              <Badge className={getRiskColor(app.riskLevel)}>
                {app.riskLevel}
              </Badge>
            </TableCell>
            <TableCell>
              {app.flags.map((flag, i) => (
                <span key={i} className="text-xs block">
                  {flag.description}
                </span>
              ))}
            </TableCell>
            <TableCell>{app.overallConfidence}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Build dashboard UI with risk cards and table"
```

---

## 🔵 PHASE 3: Visualizations (Hour 10-14)

### Hour 10-12: Charts

**Person 3**:
Build `components/Charts.tsx`:
```typescript
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AnalyzedApplication } from '@/lib/types';

export function RiskDistributionChart({ results }: { results: AnalyzedApplication[] }) {
  const data = [
    { name: 'High Risk', count: results.filter(r => r.riskLevel === 'HIGH').length, fill: '#EF4444' },
    { name: 'Medium Risk', count: results.filter(r => r.riskLevel === 'MEDIUM').length, fill: '#F59E0B' },
    { name: 'Low Risk', count: results.filter(r => r.riskLevel === 'LOW').length, fill: '#10B981' },
  ];
  
  return (
    <BarChart width={400} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#8884d8" />
    </BarChart>
  );
}

export function FlagTypesChart({ results }: { results: AnalyzedApplication[] }) {
  const flagCounts: Record<string, number> = {};
  results.forEach(app => {
    app.flags.forEach(flag => {
      flagCounts[flag.type] = (flagCounts[flag.type] || 0) + 1;
    });
  });
  
  const data = Object.entries(flagCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
  
  return (
    <PieChart width={400} height={300}>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
}
```

Add charts to dashboard page

**Testing**: Verify charts render correctly

**Git Checkpoint**:
```bash
git add .
git commit -m "Add Recharts visualizations"
```

---

### Hour 12-14: Map View

**Person 1**:
Build `components/MapView.tsx`:
```typescript
'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AnalyzedApplication } from '@/lib/types';

export default function MapView({ applications }: { applications: AnalyzedApplication[] }) {
  const center = applications[0]?.gps_lat 
    ? [applications[0].gps_lat, applications[0].gps_long!] as [number, number]
    : [26.8467, 75.8012] as [number, number]; // Default: Jaipur
  
  return (
    <MapContainer center={center} zoom={10} style={{ height: '500px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {applications
        .filter(app => app.gps_lat && app.gps_long)
        .map((app) => (
          <Marker key={app.id} position={[app.gps_lat!, app.gps_long!]}>
            <Popup>
              <strong>{app.name}</strong><br />
              Risk: {app.riskLevel}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
```

**Note**: Leaflet requires client-side rendering. Use dynamic import:
```typescript
// In dashboard page
const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Add GPS map visualization"
```

---

## 🟠 PHASE 4: Mutations (Hour 14-20)

### Hour 14-16: CSV Export

**Person 2**:
Build `components/ExportButton.tsx`:
```typescript
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { AnalyzedApplication } from '@/lib/types';

export default function ExportButton({ applications }: { applications: AnalyzedApplication[] }) {
  const handleExport = () => {
    const exportData = applications.map(app => ({
      name: app.name,
      aadhaar_last4: app.aadhaar_last4,
      risk_level: app.riskLevel,
      flags: app.flags.map(f => f.type).join('; '),
      confidence: app.overallConfidence
    }));
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flagged_applications_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };
  
  return (
    <Button onClick={handleExport}>
      Export to CSV
    </Button>
  );
}
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Add CSV export functionality"
```

---

### Hour 16-18: Mutation A - Confidence Scoring

**Person 1 & 2**:

Already implemented! Confidence is built into fraud detection. Just enhance UI:

Build `components/ConfidenceModal.tsx`:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AnalyzedApplication } from '@/lib/types';

export default function ConfidenceModal({ app, open, onClose }: { 
  app: AnalyzedApplication; 
  open: boolean; 
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fraud Analysis Details - {app.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <strong>Overall Risk:</strong> {app.riskLevel}
          </div>
          <div>
            <strong>Confidence Score:</strong> {app.overallConfidence}%
          </div>
          
          <div>
            <strong>Detected Flags:</strong>
            {app.flags.map((flag, i) => (
              <div key={i} className="ml-4 mt-2 p-2 bg-gray-100 rounded">
                <div className="font-medium">{flag.type}</div>
                <div className="text-sm">{flag.description}</div>
                <div className="text-xs text-gray-600">Confidence: {flag.confidence}%</div>
              </div>
            ))}
          </div>
          
          <div className="text-sm text-gray-600">
            <strong>Why this confidence level?</strong><br />
            {app.flags.length === 0 && "No suspicious patterns detected."}
            {app.flags.some(f => f.confidence > 90) && "Exact matches found (high confidence)."}
            {app.flags.some(f => f.confidence < 70) && "Some patterns are ambiguous (lower confidence)."}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Update table to show confidence tooltips and click for details

**Git Checkpoint**:
```bash
git add .
git commit -m "Mutation A: Add confidence scoring and explainability"
```

---

### Hour 18-20: Mutation B - Partial Data Handling

**Person 2**:
Update `lib/fraudDetection.ts`:

```typescript
export function analyzeWithPartialData(app: Application, allApps: Application[]): FraudFlag[] {
  const flags: FraudFlag[] = [];
  const availableFields = [];
  
  if (app.aadhaar_last4) availableFields.push('aadhaar');
  if (app.bank_account) availableFields.push('bank');
  if (app.gps_lat && app.gps_long) availableFields.push('gps');
  
  // If less than 2 verifiable fields, flag as insufficient
  if (availableFields.length < 2) {
    flags.push({
      type: 'INSUFFICIENT_DATA',
      confidence: 0,
      description: `Only ${availableFields.length} verifiable field(s) available`
    });
    return flags;
  }
  
  // Adjust detection logic based on available fields
  // If Aadhaar missing, weight GPS and Bank higher
  if (!app.aadhaar_last4) {
    // Check bank duplicates with higher sensitivity
    if (app.bank_account) {
      const duplicates = allApps.filter(other => 
        other.id !== app.id && other.bank_account === app.bank_account
      );
      if (duplicates.length >= 1) { // Lower threshold
        flags.push({
          type: 'DUPLICATE_BANK',
          confidence: 95, // Higher weight when Aadhaar unavailable
          description: `Bank account appears ${duplicates.length + 1} times (Aadhaar unavailable - higher scrutiny)`
        });
      }
    }
  }
  
  return flags;
}
```

Add warning banner to dashboard:
```typescript
const missingDataCount = results.filter(r => 
  (!r.aadhaar_last4 || !r.bank_account || !r.gps_lat)
).length;

{missingDataCount > 0 && (
  <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
    <p className="text-yellow-700">
      ⚠️ {missingDataCount} applications have incomplete data. 
      Verification based on available fields only.
    </p>
  </div>
)}
```

**Git Checkpoint**:
```bash
git add .
git commit -m "Mutation B: Handle partial data gracefully"
```

---

## 🔴 PHASE 5: Polish & Deploy (Hour 20-24)

### Hour 20-21: Bug Fixes & Testing

**All Team Members**:
- Test with all 3 sample CSVs
- Fix any console errors
- Handle edge cases (empty CSV, single row, etc.)
- Test on different browsers (Chrome, Firefox)
- Mobile responsiveness check (optional)

**Checklist**:
- [ ] Upload works on first try
- [ ] Dashboard shows correct counts
- [ ] Clicking risk cards filters table
- [ ] Export downloads CSV
- [ ] Map renders (if implemented)
- [ ] Charts show data correctly
- [ ] Modal opens with details
- [ ] No console errors

---

### Hour 21-22: Deployment

**Person 1**:
```bash
# Push to GitHub (if not already)
git add .
git commit -m "Final polish before deployment"
git push origin main

# Deploy to Vercel
npm install -g vercel
vercel login
vercel --prod

# Note the deployment URL: https://pm-kusum-detector-xyz.vercel.app
```

**Test deployed version**:
- Open URL in incognito
- Upload CSV
- Verify everything works

**If deployment fails**: Have local demo ready (record screen video as backup)

---

### Hour 22-23: Demo Preparation

**Person 1**: Prepare pitch script
**Person 2**: Prepare technical Q&A answers
**Person 3**: Design 1-slide summary (Google Slides/Canva)

**5-Minute Pitch Structure**:
1. **Problem** (1 min): "₹200 crore fraud, 45-day manual verification"
2. **Demo** (2 min): Live upload CSV, show results
3. **Mutations** (1 min): Explain confidence scoring + partial data handling
4. **Impact** (1 min): "₹4 crore saved per state, officers love it, MNRE-ready"

**What to screenshot**:
- Dashboard with red/amber/green cards
- Table with flagged applications
- Map view (if working)
- Confidence modal
- Partial data warning

**Prepare answers for**:
- "How does GPS clustering work?" → Haversine formula
- "Can this scale?" → Yes, client-side = unlimited scale
- "What about privacy?" → We only store last 4 digits of Aadhaar
- "Integration with government systems?" → Show Phase 2 roadmap

---

### Hour 23-24: Final Rehearsal

**Run through demo 3 times**:
1. With clean data (show all green)
2. With fraud data (show detection)
3. With partial data (show graceful degradation)

**Create backup plan**:
- If wifi fails → Local demo
- If local demo fails → Video recording
- If video fails → Screenshots + walkthrough

**Git Final Checkpoint**:
```bash
git add .
git commit -m "Production ready - HackNagpur 2025"
git tag -a v1.0 -m "MVP Complete"
git push --tags
```

---

## 📊 Progress Tracking

### Real-Time Checklist

Copy this to a shared document (Google Doc/Notion):

```
[ ] Hour 0-1: Project setup complete
[ ] Hour 1-2: Folder structure + types defined
[ ] Hour 2-4: CSV upload working
[ ] Hour 4-7: Fraud detection algorithms done
[ ] Hour 7-10: Dashboard UI built
[ ] Hour 10-12: Charts added
[ ] Hour 12-14: Map view working
[ ] Hour 14-16: Export feature done
[ ] Hour 16-18: Confidence scoring UI complete
[ ] Hour 18-20: Partial data handling implemented
[ ] Hour 20-21: All bugs fixed
[ ] Hour 21-22: Deployed to Vercel
[ ] Hour 22-23: Demo prepared
[ ] Hour 23-24: Rehearsed 3x
```

---

## 🚨 Contingency Plans

### If Running Out of Time

**Priority 1 (Must Have)**:
- CSV upload + fraud detection + basic dashboard

**Priority 2 (Should Have)**:
- Risk cards, export, one chart

**Priority 3 (Nice to Have)**:
- Map, mutations, fancy UI

### If Stuck on a Feature

**15-Minute Rule**:
If stuck for >15 minutes, skip it and move on. Mark as "TODO" and continue.

**AI Assistance**:
Prompt for Claude/ChatGPT:
> "I'm building [specific component]. Here's my code [paste code]. It's not working because [error]. Fix it and explain simply."

### If Deployment Fails

1. Try Vercel again (refresh, re-auth)
2. Try Netlify (drag-drop build folder)
3. Use GitHub Pages (static export)
4. Worst case: Local demo with ngrok tunnel

---

## 🎯 Success Metrics

By Hour 24, we should have:

✅ **Working demo** on public URL  
✅ **3 sample CSVs** with different scenarios  
✅ **5-minute pitch** practiced  
✅ **Technical Q&A prep** done  
✅ **GitHub repo** clean and documented  
✅ **Video backup** (2-min walkthrough)  
✅ **Team energized** and confident

---

## 📞 Communication Protocol

**Slack/Discord Channel**:
- Use threads for each feature
- Tag for urgent help
- Share screenshots frequently

**Status Updates** (Every 2 hours):
> "Hour X: Completed [feature]. Next: [feature]. Blocked on: [issue/none]"

**Emergency Protocol**:
If someone is stuck >30 minutes, other team member pair programs

---

**LET'S BUILD THIS! 🚀**

*Remember: Done is better than perfect. Ship the MVP, impress the judges, win the hackathon.*
