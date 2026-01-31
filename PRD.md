# Product Requirements Document (PRD)
## PM-KUSUM Solar Subsidy Fraud Detection System

**Version**: 1.0  
**Last Updated**: January 28, 2026  
**Track**: Digital Public Infrastructure (DPI-2)  
**Event**: HackNagpur 2025

---

## 📋 Executive Summary

### Product Vision
Create an intelligent fraud detection system that empowers State Nodal Agency officers to identify fraudulent PM-KUSUM subsidy applications in real-time, reducing financial leakage while ensuring legitimate farmers receive timely approvals.

### Success Metrics
- **Primary**: Detect 90%+ of fraudulent applications with <5% false positive rate
- **Efficiency**: Reduce verification time from 45 days to 5 minutes per application
- **Adoption**: Officers can use system without training (≤10 min onboarding)
- **Cost Savings**: Prevent ₹4 crore+ fraud per state annually

---

## 🎯 Problem Statement

### Current State (As-Is)

**User Persona: Rajesh Kumar**
- Role: Assistant Engineer, Rajasthan State Nodal Agency
- Age: 32, B.Tech Civil Engineering
- Workload: 200-300 applications/month
- Current Process:
  1. Receives Excel sheet from district offices
  2. Manually checks each row for duplicate Aadhaar/bank accounts
  3. Calls tehsil office to verify land records (takes 5-7 days)
  4. Physical field visit to verify GPS coordinates
  5. Compiles report for senior officer approval

**Pain Points**:
- ⏰ Takes 45+ days per batch
- 👁️ Human error in spotting duplicates across 5,000+ rows
- 📞 Gets 2-3 daily complaint calls about wrongly approved frauds
- 😰 Fears audit penalties (career risk)
- 🔄 No cross-district visibility (fraud in Jaipur not visible to Udaipur officer)

### Future State (To-Be)

**With Our Solution**:
1. Upload CSV (single file or bulk)
2. System auto-flags suspicious applications in 5 seconds
3. Review dashboard with color-coded risk levels
4. Export report for field team
5. Focus manual verification only on high-risk cases (10-15% of total)

**Outcome**:
- ⚡ 90% faster processing
- 🎯 99% duplicate detection accuracy
- 📊 Data-driven decision making
- 🛡️ Audit-ready documentation

---

## 👥 User Personas

### Primary User: Field Officer (Rajesh Kumar)
- **Goal**: Quickly identify fraudulent applications without missing genuine ones
- **Tech Comfort**: Medium (uses Excel, WhatsApp, government portals)
- **Device**: Desktop PC (Windows 10, intermittent internet)
- **Language**: English + Hindi (UI should support both)
- **Key Need**: Simple interface, clear explanations for flags

### Secondary User: District Coordinator
- **Goal**: Monitor overall fraud trends across multiple blocks
- **Tech Comfort**: High (MBA, data-savvy)
- **Device**: Laptop + mobile
- **Key Need**: Analytics dashboard, export reports for meetings

### Tertiary User: MNRE Auditor
- **Goal**: Verify that state agencies are doing due diligence
- **Tech Comfort**: Medium
- **Key Need**: Audit trail, explainability of automated decisions

---

## 🔧 Functional Requirements

### FR-1: CSV Upload & Parsing

**User Story**: As a field officer, I want to upload CSV files containing application data so that I can analyze them for fraud patterns.

**Acceptance Criteria**:
- [ ] Supports CSV files up to 100MB (≈100,000 applications)
- [ ] Drag-and-drop or file picker interface
- [ ] Shows preview of first 10 rows before processing
- [ ] Validates required columns (name, application_date)
- [ ] Provides clear error messages for malformed CSVs
- [ ] Processes 10,000 rows in <10 seconds

**Technical Notes**:
- Use PapaParse for client-side parsing (no server upload needed)
- Store parsed data in browser memory (IndexedDB for large files)

---

### FR-2: Duplicate Detection

**User Story**: As a field officer, I want the system to automatically flag duplicate Aadhaar numbers, bank accounts, and phone numbers so that I can catch repeat applicants.

**Acceptance Criteria**:
- [ ] Detects exact Aadhaar matches (last 4 digits)
- [ ] Flags if same bank account appears ≥2 times
- [ ] Flags if same phone number appears ≥3 times
- [ ] Shows count: "This Aadhaar appears in 4 applications"
- [ ] Highlights all related applications when one is clicked

**Algorithm**:
```javascript
// Pseudocode
duplicates = {}
for each application:
  if aadhaar in duplicates:
    flag both applications as "Duplicate Aadhaar"
  else:
    duplicates[aadhaar] = application
```

---

### FR-3: GPS Clustering Analysis

**User Story**: As a field officer, I want to see if multiple applications are suspiciously close to each other so that I can verify if they're from the same location (ghost beneficiaries).

**Acceptance Criteria**:
- [ ] Flags if ≥5 applications within 500m radius
- [ ] Shows map with clustered points highlighted in red
- [ ] Calculates distance using Haversine formula
- [ ] Allows officer to adjust radius threshold (200m - 2km)

**Technical Notes**:
- Use Leaflet.js for map rendering
- Haversine formula for GPS distance:
  ```javascript
  distance = acos(sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1)) * 6371 // km
  ```

---

### FR-4: Risk Scoring & Categorization

**User Story**: As a field officer, I want applications automatically categorized into Red/Amber/Green so that I can prioritize my verification work.

**Acceptance Criteria**:
- [ ] **Red (High Risk)**: ≥2 flags triggered
- [ ] **Amber (Medium Risk)**: 1 flag triggered
- [ ] **Green (Low Risk)**: 0 flags
- [ ] Dashboard shows count of each category
- [ ] Click category to filter table
- [ ] Each application shows list of flags: "⚠️ Duplicate Aadhaar, ⚠️ New Bank Account"

**Flags Implemented**:
| Flag | Condition | Weight |
|------|-----------|--------|
| Duplicate Aadhaar | Aadhaar appears ≥2 times | Critical |
| Duplicate Bank | Same account ≥2 times | Critical |
| GPS Cluster | ≥5 apps within 500m | High |
| New Bank Account | Account age <90 days | Medium |
| Duplicate Phone | Same number ≥3 times | Low |

---

### FR-5: Interactive Dashboard

**User Story**: As a field officer, I want to see visualizations of fraud patterns so that I can understand trends at a glance.

**Acceptance Criteria**:
- [ ] Bar chart: Red vs Amber vs Green counts
- [ ] Pie chart: Fraud types distribution
- [ ] Timeline: Applications per day (spot bulk submissions)
- [ ] Map: GPS points with color-coded risk levels
- [ ] All charts clickable (filters table on click)

**Tools**: Recharts (simple, React-friendly)

---

### FR-6: Export & Reporting

**User Story**: As a field officer, I want to download a report of flagged applications so that I can share it with my field verification team.

**Acceptance Criteria**:
- [ ] Export filtered data as CSV
- [ ] Generate PDF report with:
  - Summary stats (total apps, red/amber/green counts)
  - List of flagged applications with reasons
  - Officer name and date
- [ ] One-click download (no registration required)

---

### FR-7: Confidence Scoring (Mutation A)

**User Story**: As a field officer, I want to know how confident the system is about each fraud flag so that I can avoid wrongly rejecting genuine applications.

**Acceptance Criteria**:
- [ ] Each flag has confidence score (0-100%)
- [ ] Overall application risk score (weighted average)
- [ ] Explainability: "90% confident - Aadhaar appears in 5 applications across 3 districts"
- [ ] Color gradient: Red (>80%), Amber (50-80%), Green (<50%)
- [ ] Manual override button: "Mark as False Positive"

**Confidence Calculation**:
```javascript
confidence = {
  duplicateAadhaar: 95%, // Very high (exact match)
  duplicateBank: 90%,    // High (exact match)
  gpsCluster: 70%,       // Medium (could be neighbors)
  newBankAccount: 40%,   // Low (could be legitimate first-timer)
  duplicatePhone: 30%    // Low (could be family shared phone)
}
```

---

### FR-8: Partial Data Handling (Mutation B)

**User Story**: As a field officer, I want the system to work even when some data fields are missing so that I can still detect fraud using available information.

**Acceptance Criteria**:
- [ ] System works with ANY 2 of: Aadhaar, Bank Account, Phone, GPS
- [ ] Shows warning: "⚠️ Missing Aadhaar data - verification based on GPS + Bank only"
- [ ] Adjusts risk scoring weights dynamically:
  - If Aadhaar missing: GPS & Bank weighted higher
  - If GPS missing: Aadhaar & Bank weighted higher
- [ ] Flags applications with <2 verifiable fields as "Insufficient Data"

**Fallback Logic**:
```javascript
if (no aadhaar):
  increase GPS clustering weight by 1.5x
  increase bank account duplicate weight by 1.3x
if (no GPS):
  increase aadhaar duplicate weight by 1.5x
```

---

## 🎨 Non-Functional Requirements

### NFR-1: Performance
- Load 100,000 applications in <15 seconds
- Dashboard interactions <500ms response time
- Works offline after initial data load

### NFR-2: Usability
- Zero training required (officers already know Excel)
- All text in English + Hindi
- Mobile-responsive (officers may use tablets in field)
- Accessibility: WCAG 2.1 AA compliant

### NFR-3: Security
- No sensitive data stored on servers (client-side processing)
- Optional: Save to Supabase with role-based access
- Audit log: Track who flagged what and when

### NFR-4: Scalability
- Single-page app (no server load)
- Can handle 10 concurrent officers analyzing different datasets
- Vercel deployment scales automatically

### NFR-5: Maintainability
- Clean code (TypeScript, ESLint, Prettier)
- Comprehensive comments for vibe-coders
- Git workflow: feature branches, PR reviews

---

## 🚫 Out of Scope (V1)

**Not Building in 24 Hours**:
- ❌ Real-time database sync across districts
- ❌ Mobile app (web-only)
- ❌ Integration with government APIs (DigiLocker, DISCOM)
- ❌ Machine learning models (rule-based only)
- ❌ User authentication (demo mode only)
- ❌ Multi-language support beyond English/Hindi

**Future Phases**:
- Phase 2: ML-based fraud prediction
- Phase 3: Government API integrations
- Phase 4: Mobile app for field officers

---

## 📊 Data Requirements

### Input Data Schema

```typescript
interface Application {
  // Required
  name: string;
  application_date: string; // YYYY-MM-DD
  
  // Optional (at least 2 required)
  aadhaar_last4?: string;   // Last 4 digits
  phone?: string;           // 10 digits
  bank_account?: string;
  gps_lat?: number;
  gps_long?: number;
  
  // Additional (for context)
  land_survey_no?: string;
  pump_capacity?: string;
  district?: string;
}
```

### Sample Data
Provide 3 CSV files for testing:
1. `clean-data.csv` - 500 applications, 0 frauds
2. `fraud-mix.csv` - 500 applications, 30% frauds (realistic scenario)
3. `edge-cases.csv` - 100 applications with missing fields

---

## 🧪 Testing Strategy

### Unit Tests (Jest)
- CSV parsing edge cases (malformed data, special characters)
- Fraud detection algorithms (known inputs → expected outputs)
- Confidence scoring calculations

### Integration Tests
- Upload CSV → See results in dashboard
- Click red category → Table filters correctly
- Export CSV → File downloads with correct data

### User Acceptance Testing (During Hackathon)
- Judges upload their own CSV → System handles it
- Demo with real PM-KUSUM data (anonymized)
- Mutation scenarios tested live

---

## 📈 Success Metrics (KPIs)

### Quantitative
- **Fraud Detection Rate**: >90% of seeded frauds caught
- **False Positive Rate**: <5%
- **Processing Speed**: 10,000 applications in <10 seconds
- **System Uptime**: 99.9% during demo period

### Qualitative
- **Judge Feedback**: "This solves a real problem"
- **Usability**: Judges can use without instructions
- **Impact**: Judges see government adoption potential

---

## 🗓️ Release Plan

### Hackathon Timeline
- **Hour 0-8**: Base MVP (FR-1 to FR-6)
- **Hour 8-16**: Mutation A implementation (FR-7)
- **Hour 16-22**: Mutation B implementation (FR-8)
- **Hour 22-24**: Polish, deploy, demo prep

### Post-Hackathon
- **Week 1-2**: Refine based on judge feedback
- **Month 1**: Pilot with 1 State Nodal Agency
- **Month 3**: Iterate based on real-world usage
- **Month 6**: Proposal to MNRE for national rollout

---

## 🤝 Stakeholder Sign-Off

**Product Owner**: [Your Name]  
**Tech Lead**: [Teammate Name]  
**Design Lead**: [Teammate Name]  

**Approved by**: HackNagpur Team (Implicit via problem statement selection)

---

## 📚 References

1. **PM-KUSUM Scheme Guidelines**: [mnre.gov.in/kusum](https://mnre.gov.in)
2. **DPI-2 Problem Statement**: HackNagpur GitHub
3. **CAG Audit Reports**: Subsidy leakage data (2022-2024)
4. **User Research**: Interviews with 3 State Nodal Agency officers (simulated)

---

**Document Status**: ✅ Approved for Development  
**Next Review**: Post-Hackathon (February 2026)
