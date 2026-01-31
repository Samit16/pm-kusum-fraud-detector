
export interface Application {
    id: string; // generated or row index
    name: string;
    application_date: string;
    aadhaar_last4?: string;
    phone?: string;
    bank_account?: string;
    gps_lat?: number;
    gps_long?: number;
    [key: string]: any;
}

export interface FraudFlag {
    applicationId: string;
    type: 'DUPLICATE_AADHAAR' | 'DUPLICATE_BANK' | 'DUPLICATE_PHONE' | 'GPS_CLUSTER' | 'NEW_BANK_ACCOUNT';
    relatedTo?: string[]; // IDs of related applications
    confidence: number;
    description: string;
}

const CONFIDENCE_SCORES = {
    DUPLICATE_AADHAAR: 95,
    DUPLICATE_BANK: 90,
    GPS_CLUSTER: 70,
    DUPLICATE_PHONE: 30,
    NEW_BANK_ACCOUNT: 40,
};

// Haversine distance in km
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export function detectFraud(applications: Application[]): FraudFlag[] {
    const flags: FraudFlag[] = [];
    const aadhaarMap = new Map<string, string[]>(); // value -> [appIds]
    const bankMap = new Map<string, string[]>();
    const phoneMap = new Map<string, string[]>();

    // 1. Group by identifiers
    applications.forEach(app => {
        if (app.aadhaar_last4) {
            const existing = aadhaarMap.get(app.aadhaar_last4) || [];
            existing.push(app.id);
            aadhaarMap.set(app.aadhaar_last4, existing);
        }
        if (app.bank_account) {
            const existing = bankMap.get(app.bank_account) || [];
            existing.push(app.id);
            bankMap.set(app.bank_account, existing);
        }
        if (app.phone) {
            const existing = phoneMap.get(app.phone) || [];
            existing.push(app.id);
            phoneMap.set(app.phone, existing);
        }
    });

    // 2. Generate flags for duplicates
    aadhaarMap.forEach((ids, aadhaar) => {
        if (ids.length >= 2) {
            ids.forEach(id => {
                const related = ids.filter(i => i !== id);
                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_AADHAAR',
                    relatedTo: related,
                    confidence: CONFIDENCE_SCORES.DUPLICATE_AADHAAR,
                    description: `Aadhaar ${aadhaar} appears in ${ids.length} applications`
                });
            });
        }
    });

    bankMap.forEach((ids, bank) => {
        if (ids.length >= 2) {
            ids.forEach(id => {
                const related = ids.filter(i => i !== id);
                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_BANK',
                    relatedTo: related,
                    confidence: CONFIDENCE_SCORES.DUPLICATE_BANK,
                    description: `Bank Account ${bank} appears in ${ids.length} applications`
                });
            });
        }
    });

    phoneMap.forEach((ids, phone) => {
        if (ids.length >= 3) {
            ids.forEach(id => {
                const related = ids.filter(i => i !== id);
                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_PHONE',
                    relatedTo: related,
                    confidence: CONFIDENCE_SCORES.DUPLICATE_PHONE,
                    description: `Phone ${phone} appears in ${ids.length} applications`
                });
            });
        }
    });

    // 3. GPS Clustering
    // Need to find groups of apps within 500m (0.5km)
    // For O(N^2) with N=10000 might be slow (100M iterations).
    // Optimization: Only compare if both have GPS.

    const appsWithGps = applications.filter(a => a.gps_lat != null && a.gps_long != null);

    // To avoid huge output, we only flag if count >= 5
    // We can just iterate and count neighbors for each node.

    for (let i = 0; i < appsWithGps.length; i++) {
        const appA = appsWithGps[i];
        const neighbors: string[] = [];

        for (let j = 0; j < appsWithGps.length; j++) {
            if (i === j) continue;
            const appB = appsWithGps[j];

            const dist = getDistance(appA.gps_lat!, appA.gps_long!, appB.gps_lat!, appB.gps_long!);
            if (dist <= 0.5) { // 500 meters
                neighbors.push(appB.id);
            }
        }

        if (neighbors.length + 1 >= 5) { // +1 for itself
            flags.push({
                applicationId: appA.id,
                type: 'GPS_CLUSTER',
                relatedTo: neighbors,
                confidence: CONFIDENCE_SCORES.GPS_CLUSTER,
                description: `${neighbors.length + 1} applications within 500m radius`
            });
        }
    }

    return flags;
}
