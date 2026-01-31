
export interface Application {
    id: string;
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
    type: 'DUPLICATE_AADHAAR' | 'DUPLICATE_BANK' | 'DUPLICATE_PHONE' | 'GPS_CLUSTER' | 'NEW_BANK_ACCOUNT' | 'INSUFFICIENT_DATA';
    relatedTo?: string[];
    confidence: number;
    description: string;
}

const BASE_CONFIDENCE = {
    DUPLICATE_AADHAAR: 95,
    DUPLICATE_BANK: 90,
    GPS_CLUSTER: 70,
    DUPLICATE_PHONE: 30,
    NEW_BANK_ACCOUNT: 40,
    INSUFFICIENT_DATA: 100
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
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
    const aadhaarMap = new Map<string, string[]>();
    const bankMap = new Map<string, string[]>();
    const phoneMap = new Map<string, string[]>();

    // Partial Data Map to track what's missing for weight adjustments
    const missingFieldsMap = new Map<string, { noAadhaar: boolean, noGps: boolean, noBank: boolean }>();

    applications.forEach(app => {
        let presentFields = 0;
        if (app.aadhaar_last4) presentFields++;
        if (app.bank_account) presentFields++;
        if (app.phone) presentFields++;
        if (app.gps_lat != null && app.gps_long != null) presentFields++;

        const noAadhaar = !app.aadhaar_last4;
        const noGps = app.gps_lat == null || app.gps_long == null;
        const noBank = !app.bank_account;

        missingFieldsMap.set(app.id, { noAadhaar, noGps, noBank });

        if (presentFields < 2) {
            flags.push({
                applicationId: app.id,
                type: 'INSUFFICIENT_DATA',
                confidence: BASE_CONFIDENCE.INSUFFICIENT_DATA,
                description: `Insufficient verifiable data. Only ${presentFields} fields present.`
            });
        }

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

    aadhaarMap.forEach((ids, aadhaar) => {
        if (ids.length >= 2) {
            ids.forEach(id => {
                const missing = missingFieldsMap.get(id);
                // If GPS is missing, increase importance of Aadhaar duplicate
                let score = BASE_CONFIDENCE.DUPLICATE_AADHAAR;
                if (missing?.noGps) {
                    score = Math.min(100, Math.round(score * 1.5)); // +50% weight if no GPS
                }

                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_AADHAAR',
                    relatedTo: ids.filter(i => i !== id),
                    confidence: score,
                    description: `Aadhaar ${aadhaar} appears in ${ids.length} applications`
                });
            });
        }
    });

    bankMap.forEach((ids, bank) => {
        if (ids.length >= 2) {
            ids.forEach(id => {
                const missing = missingFieldsMap.get(id);
                // If Aadhaar is missing, increase importance of Bank duplicate
                let score = BASE_CONFIDENCE.DUPLICATE_BANK;
                if (missing?.noAadhaar) {
                    score = Math.min(100, Math.round(score * 1.3));
                }

                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_BANK',
                    relatedTo: ids.filter(i => i !== id),
                    confidence: score,
                    description: `Bank Account ${bank} appears in ${ids.length} applications`
                });
            });
        }
    });

    phoneMap.forEach((ids, phone) => {
        if (ids.length >= 3) {
            ids.forEach(id => {
                flags.push({
                    applicationId: id,
                    type: 'DUPLICATE_PHONE',
                    relatedTo: ids.filter(i => i !== id),
                    confidence: BASE_CONFIDENCE.DUPLICATE_PHONE,
                    description: `Phone ${phone} appears in ${ids.length} applications`
                });
            });
        }
    });

    const appsWithGps = applications.filter(a => a.gps_lat != null && a.gps_long != null);

    for (let i = 0; i < appsWithGps.length; i++) {
        const appA = appsWithGps[i];
        const neighbors: string[] = [];

        for (let j = 0; j < appsWithGps.length; j++) {
            if (i === j) continue;
            const appB = appsWithGps[j];

            const dist = getDistance(appA.gps_lat!, appA.gps_long!, appB.gps_lat!, appB.gps_long!);
            if (dist <= 0.5) {
                neighbors.push(appB.id);
            }
        }

        if (neighbors.length + 1 >= 5) {
            const missing = missingFieldsMap.get(appA.id);
            let score = BASE_CONFIDENCE.GPS_CLUSTER;
            if (missing?.noAadhaar) {
                score = Math.min(100, Math.round(score * 1.5));
            }

            flags.push({
                applicationId: appA.id,
                type: 'GPS_CLUSTER',
                relatedTo: neighbors,
                confidence: score,
                description: `${neighbors.length + 1} applications within 500m radius`
            });
        }
    }

    return flags;
}
