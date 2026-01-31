# MVP Scope Document
## PM-KUSUM Fraud Detection System - 24 Hour Build

**Version**: 1.0  
**Build Window**: 24 hours (HackNagpur 2025)  
**Target**: Working demo + deployed app + pitch deck

---

## 🎯 MVP Philosophy

> **"Build the simplest version that proves the concept and impresses judges"**

We're NOT building:
- ❌ Enterprise-grade auth system
- ❌ Complex backend infrastructure
- ❌ Production-ready scalability
- ❌ Perfect UI/UX

We ARE building:
- ✅ Core fraud detection that works
- ✅ Visual proof of concept (dashboard)
- ✅ Live demo that judges can interact with
- ✅ Clear path to production (documented)

---

## 🏗️ MVP Feature Set

### ✅ MUST HAVE (Core MVP - Hour 0-12)

#### 1. CSV Upload Interface
**What**: Simple file upload page  
**Why**: Entry point for all data  
**Scope**:
- Drag-and-drop zone OR file picker button
- Parses CSV using PapaParse
- Shows first 10 rows as preview
- "Analyze" button to process

**No frills**:
- No file validation (assume CSV is correct format)
- No progress bar (processing is instant)
- No file history (one-time upload)

**Code Estimate**: 2 hours

---

#### 2. Duplicate Detection Engine
**What**: JavaScript logic to find duplicates  
**Why**: Core fraud detection capability  
**Scope**:

```javascript
// Simple but effective algorithm
function detectFraud(applications) {
  const aadhaarMap = {};
  const bankMap = {};
  const flags = [];
  
  applications.forEach(app => {
    // Check Aadhaar duplicates
    if (aadhaarMap[app.aadhaar]) {
      flags.push({
        application: app,
        type: 'DUPLICATE_AADHAAR',
        relatedTo: aadhaarMap[app.aadhaar]
      });
    } else {
      aadhaarMap[app.aadhaar] = app;
    }
    
    // Repeat for bank account, phone
  });
  
  return flags;
}
```

**Detection Rules**:
- Aadhaar appears ≥2 times → Flag both
- Bank account appears ≥2 times → Flag both
- Phone appears ≥3 times → Flag all (family sharing allowed)

**Code Estimate**: 3 hours

---

#### 3. GPS Clustering Detection
**What**: Find applications too close to each other  
**Why**: Detects ghost beneficiaries at same location  
**Scope**:

```javascript
// Haversine distance formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Flag if ≥5 applications within 500m
function detectClusters(applications) {
  // Brute force: compare each app with every other app
  // O(n²) but fine for 10,000 applications
}
```

**Code Estimate**: 3 hours

---

#### 4. Risk Categorization Dashboard
**What**: Main results page with Red/Amber/Green sections  
**Why**: Visual summary judges can understand instantly  
**Scope**:

```
+----------------------------------+
|  🔴 High Risk: 23 applications   |
|  ⚠️ Medium Risk: 67              |
|  ✅ Low Risk: 210                |
+----------------------------------+
|                                  |
|  [Filtered Table View]           |
|  Name | Aadhaar | Flags          |
|  -----|---------|----------------|
|  Ram  | 1234    | Dup Aadhaar,   |
|       |         | GPS Cluster    |
+----------------------------------+
```

**Interactions**:
- Click Red section → Table shows only high-risk apps
- Click any row → Modal with details
- Search bar → Filter by name/Aadhaar

**Code Estimate**: 4 hours

---

### 🎨 SHOULD HAVE (Polish - Hour 12-18)

#### 5. Map Visualization
**What**: Interactive map showing GPS points  
**Why**: Visual proof of clustering (impressive in demo)  
**Scope**:
- Use Leaflet.js (free, no API key)
- Plot all applications as markers
- Color-code: Red (flagged), Green (clean)
- Click marker → Show application details

**Libraries**:
- `react-leaflet` (React wrapper)
- OpenStreetMap tiles (free)

**Code Estimate**: 2 hours

---

#### 6. Simple Charts
**What**: Bar chart of Red/Amber/Green counts  
**Why**: Makes dashboard look professional  
**Scope**:
- Recharts library (copy-paste examples)
- 2 charts max:
  1. Risk distribution (bar chart)
  2. Flags breakdown (pie chart)

**Code Estimate**: 2 hours

---

#### 7. Export to CSV
**What**: Download button for flagged applications  
**Why**: Officers need to share with field team  
**Scope**:
- Button: "Download Red-Flagged Applications"
- Uses PapaParse to convert back to CSV
- Filename: `flagged_applications_2025-01-28.csv`

**Code Estimate**: 1 hour

---

### 🚀 NICE TO HAVE (If Time Permits - Hour 18-22)

#### 8. Confidence Scoring (Mutation A)
**What**: Show probability % for each flag  
**Why**: Handles "minimize false rejections" requirement  
**Scope**:

```javascript
const confidenceWeights = {
  DUPLICATE_AADHAAR: 0.95,    // Very confident
  DUPLICATE_BANK: 0.90,
  GPS_CLUSTER: 0.70,          // Medium (could be neighbors)
  NEW_BANK_ACCOUNT: 0.40,     // Low (could be legit)
  DUPLICATE_PHONE: 0.30
};

function calculateConfidence(flags) {
  if (flags.length === 0) return 0;
  const sum = flags.reduce((acc, flag) => 
    acc + confidenceWeights[flag.type], 0);
  return Math.round((sum / flags.length) * 100);
}
```

**UI Change**:
- Red flags show: "🔴 High Risk (85% confidence)"
- Hover → Tooltip: "Based on: Duplicate Aadhaar (95% confident)"

**Code Estimate**: 2 hours

---

#### 9. Partial Data Handling (Mutation B)
**What**: Work even when Aadhaar/GPS/Bank missing  
**Why**: Handles "work with partial data" requirement  
**Scope**:

```javascript
function detectWithPartialData(application) {
  const availableFields = [];
  if (application.aadhaar) availableFields.push('aadhaar');
  if (application.bank) availableFields.push('bank');
  if (application.gps_lat) availableFields.push('gps');
  
  if (availableFields.length < 2) {
    return { 
      flag: 'INSUFFICIENT_DATA',
      confidence: 0 
    };
  }
  
  // Adjust weights dynamically
  if (!application.aadhaar) {
    // Rely more on bank + GPS
    return checkBankAndGPS(application);
  }
}
```

**UI Change**:
- Yellow banner: "⚠️ 15 applications have missing Aadhaar data - flagging based on available fields"

**Code Estimate**: 2 hours

---

### ❌ OUT OF SCOPE (Even if we have extra time)

These are tempting but will derail us:

1. **User Authentication** - Just use mock login or no auth
2. **Database Persistence** - All in-memory is fine for demo
3. **Multi-file Upload** - One CSV at a time
4. **Email Alerts** - Manual export is enough
5. **Advanced ML** - Rule-based detection is sufficient
6. **Real Government API Integration** - Mock data only
7. **Mobile App** - Desktop web is enough
8. **Detailed Analytics** - Basic charts are enough
9. **Admin Panel** - Single user interface only
10. **Internationalization** - English only (add Hindi labels if time)

---

## 🎨 UI/UX Simplifications

### Page 1: Upload
```
+----------------------------------------+
|        PM-KUSUM Fraud Detector         |
|                                        |
|    [Drag CSV here or click to upload] |
|                                        |
|         [Sample CSV Download]          |
+----------------------------------------+
```

### Page 2: Dashboard
```
+----------------------------------------+
|  Summary                   [Export CSV]|
|  🔴 High: 23  ⚠️ Med: 67  ✅ Low: 210 |
+----------------------------------------+
|  [Search: ________]                    |
|                                        |
|  Name       | Aadhaar | Flags          |
|  -----------|---------|----------------|
|  Ramesh K.  | 1234    | Dup Aadhaar    |
|  Suresh P.  | 5678    | GPS Cluster    |
|                                        |
+----------------------------------------+
|  [Map View] [Charts]                   |
+----------------------------------------+
```

**Design Principles**:
- Use Tailwind utility classes (no custom CSS)
- Copy shadcn/ui components (pre-built, looks professional)
- Stick to 3 colors: Red (#EF4444), Amber (#F59E0B), Green (#10B981)
- No animations (waste of time)
- Desktop-first (judges use laptops)

---

## 📦 Tech Stack (Final Decision)

### Frontend
```json
{
  "framework": "Next.js 14",
  "styling": "Tailwind CSS",
  "components": "shadcn/ui",
  "charts": "recharts",
  "maps": "react-leaflet",
  "csv": "papaparse"
}
```

### Backend (Minimal)
```json
{
  "api": "Next.js API routes",
  "database": "None (client-side only)",
  "auth": "None (demo mode)"
}
```

### Deployment
```json
{
  "hosting": "Vercel",
  "domain": "Auto-generated .vercel.app",
  "ci/cd": "Automatic on git push"
}
```

---

## 🧪 Testing Strategy (Minimal Viable)

### Manual Testing Checklist
- [ ] Upload `sample-clean.csv` → All green
- [ ] Upload `sample-fraud.csv` → 30% red/amber
- [ ] Click red section → Table filters
- [ ] Click any row → Details modal opens
- [ ] Export CSV → File downloads correctly
- [ ] Map shows points (if implemented)

### Edge Cases to Handle
- [ ] Empty CSV → Show error message
- [ ] Malformed CSV → Show parsing error
- [ ] Very large file (50k+ rows) → Show loading spinner
- [ ] Missing required columns → Guide user

**No automated tests** - Not worth the time in 24 hours

---

## 📊 Sample Data Preparation

### File 1: `sample-clean-data.csv`
- 100 applications
- 0 frauds
- All fields complete
- **Purpose**: Show system doesn't over-flag

### File 2: `sample-fraud-data.csv`
- 100 applications
- 30 frauds seeded:
  - 10 duplicate Aadhaar
  - 10 duplicate bank accounts
  - 5 GPS clusters (5 apps at same location)
  - 5 combination frauds
- **Purpose**: Main demo file

### File 3: `sample-partial-data.csv` (for Mutation B)
- 50 applications
- 50% missing Aadhaar column
- 30% missing GPS
- **Purpose**: Show graceful degradation

**Where to get data**: Generate using ChatGPT/Claude or write a Python script

---

## ⏱️ Hour-by-Hour Build Plan

### Hour 0-2: Project Setup
- [ ] `npx create-next-app pm-kusum-detector`
- [ ] Install dependencies: papaparse, recharts, react-leaflet
- [ ] Setup Tailwind + shadcn/ui
- [ ] Create basic folder structure
- [ ] Git init + first commit

### Hour 2-4: Upload Page
- [ ] File upload component
- [ ] CSV parsing with PapaParse
- [ ] Preview table (first 10 rows)
- [ ] "Analyze" button → Navigate to dashboard

### Hour 4-7: Fraud Detection Logic
- [ ] Write `fraudDetection.ts` utility
- [ ] Duplicate Aadhaar detection
- [ ] Duplicate bank account detection
- [ ] GPS clustering (Haversine formula)
- [ ] Test with sample data

### Hour 7-10: Dashboard UI
- [ ] Results page layout
- [ ] Red/Amber/Green summary cards
- [ ] Filterable data table
- [ ] Details modal

### Hour 10-12: Basic Charts
- [ ] Bar chart (Recharts)
- [ ] Risk distribution pie chart

### Hour 12-14: Map View
- [ ] Leaflet integration
- [ ] Plot GPS points
- [ ] Color-code markers

### Hour 14-16: Export Feature
- [ ] CSV export button
- [ ] Generate file with PapaParse

### Hour 16-18: Mutation A (Confidence Scoring)
- [ ] Add confidence % calculation
- [ ] Update UI with confidence badges
- [ ] Explainability tooltips

### Hour 18-20: Mutation B (Partial Data)
- [ ] Fallback logic for missing fields
- [ ] Warning banners for insufficient data
- [ ] Adjusted risk weights

### Hour 20-22: Polish
- [ ] Fix bugs
- [ ] Add loading states
- [ ] Improve error handling
- [ ] Responsive tweaks

### Hour 22-23: Deploy
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Test live URL
- [ ] Create shareable demo link

### Hour 23-24: Demo Prep
- [ ] Prepare pitch script
- [ ] Load demo data
- [ ] Practice walkthrough
- [ ] Screenshot key screens

---

## 🎤 Demo Script (5 Minutes)

### Minute 1: Problem Statement
> "Every year, ₹200 crore is lost to fraud in PM-KUSUM solar subsidies. Officers manually check thousands of applications in Excel, taking 45 days per batch. We built a system that does this in 5 seconds."

### Minute 2: Upload Demo
> [Share screen, upload `sample-fraud-data.csv`]  
> "I'm uploading 100 applications. Watch what happens..."

### Minute 3: Dashboard Walkthrough
> "23 high-risk applications flagged instantly. Let's look at one..."  
> [Click red row, show details modal]  
> "This Aadhaar appears in 4 applications across 2 districts."

### Minute 4: Mutations
> "When you gave us Mutation A - minimize false rejections - we added confidence scoring. This flag is 85% confident, not 100%."  
> [Show confidence badge]  
> "For Mutation B - partial data - watch this..."  
> [Upload CSV with missing Aadhaar, show yellow warning]

### Minute 5: Impact
> "This saves ₹4 crore per state annually. Officers go from 45 days to 5 minutes. Zero training needed - they already know Excel."

---

## ✅ Definition of Done

An MVP is complete when:

1. **Functional**:
   - [ ] Can upload CSV and see results
   - [ ] Fraud detection algorithms work correctly
   - [ ] Dashboard displays risk categorization
   - [ ] Export feature works

2. **Demonstrable**:
   - [ ] Deployed to public URL
   - [ ] Works on judge's laptop (cross-browser tested)
   - [ ] Sample data pre-loaded for quick demo
   - [ ] No crashes or console errors

3. **Explainable**:
   - [ ] Can explain each flag in plain English
   - [ ] Mutations clearly addressed
   - [ ] Future roadmap documented

4. **Professional**:
   - [ ] UI looks polished (thanks to Tailwind + shadcn)
   - [ ] Code is clean enough for judges to review
   - [ ] README has clear setup instructions

---

## 🚨 Risk Mitigation

### Risk 1: Running Out of Time
**Mitigation**: Cut nice-to-haves first (map, charts), focus on core detection

### Risk 2: CSV Parsing Breaks
**Mitigation**: Test with 5 different CSV formats early, handle errors gracefully

### Risk 3: Deployment Issues
**Mitigation**: Deploy at Hour 20 (4-hour buffer), have local demo as backup

### Risk 4: Live Demo Fails
**Mitigation**: Record video walkthrough, have screenshots ready

### Risk 5: Judges Ask Technical Questions
**Mitigation**: Prepare answers for:
- "How does GPS clustering work?" → Haversine formula
- "What if data is wrong?" → Confidence scoring handles uncertainty
- "Can this scale?" → Yes, client-side = no server bottleneck

---

## 📈 Success Criteria

### Must Achieve (70% Score)
- Fraud detection works correctly
- Dashboard displays results clearly
- Can demo live without crashes
- Mutations addressed (even if basic implementation)

### Good Performance (80-90% Score)
- All of above +
- Professional UI/UX
- Charts and map visualization
- Export feature works
- Judges say "this is practical"

### Exceptional (90-100% Score)
- All of above +
- Confidence scoring implemented well
- Partial data handling robust
- Judge tries to break it and can't
- Government officials ask for pilot

---

**Document Status**: ✅ Approved - Ready to Build  
**Next Step**: Start Hour 0-2 (Project Setup)
