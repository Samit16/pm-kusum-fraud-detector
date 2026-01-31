
import express from 'express';
import cors from 'cors';
import { detectFraud, Application } from './fraudEngine';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

function normalizeData(rawData: any[]): Application[] {
    return rawData.map((row, index) => {
        const findValue = (keys: string[]) => {
            for (const k of keys) {
                const found = Object.keys(row).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
                if (found) return row[found];
            }
            return undefined;
        };

        return {
            id: String(index + 1).padStart(3, '0'),
            name: findValue(['name', 'beneficiaryname', 'beneficiary_name']) || 'Unknown',
            application_date: findValue(['date', 'application_date', 'applicationdate']) || new Date().toISOString().split('T')[0],
            aadhaar_last4: findValue(['aadhaar', 'aadhaar_last_4', 'aadhaar(last4)', 'adharnumber']),
            phone: findValue(['phone', 'mobile', 'phonenumber']),
            bank_account: findValue(['bank', 'bank_account', 'accountnumber', 'bankaccount']),
            gps_lat: parseFloat(findValue(['lat', 'latitude', 'gps_lat'])) || undefined,
            gps_long: parseFloat(findValue(['long', 'longitude', 'gps_long'])) || undefined,
            originalData: row
        };
    });
}

app.post('/api/analyze', (req, res) => {
    try {
        const rawData = req.body;
        if (!Array.isArray(rawData)) {
            res.status(400).json({ error: 'Expected an array of application data' });
            return;
        }

        console.log(`Received ${rawData.length} records for analysis`);

        const applications = normalizeData(rawData);
        const flags = detectFraud(applications);

        const results = applications.map(app => {
            const appFlags = flags.filter(f => f.applicationId === app.id);
            let riskLevel = 'Low';

            if (appFlags.some(f => f.type === 'DUPLICATE_AADHAAR' || f.type === 'DUPLICATE_BANK')) {
                riskLevel = 'High';
            } else if (appFlags.some(f => f.type === 'GPS_CLUSTER')) {
                riskLevel = 'High';
            } else if (appFlags.length >= 2) {
                riskLevel = 'High';
            } else if (appFlags.length === 1) {
                riskLevel = 'Medium';
            }

            return {
                ...app,
                riskLevel,
                flags: appFlags
            };
        });

        const summary = {
            total: applications.length,
            highRisk: results.filter(r => r.riskLevel === 'High').length,
            mediumRisk: results.filter(r => r.riskLevel === 'Medium').length,
            lowRisk: results.filter(r => r.riskLevel === 'Low').length,
        };

        res.json({
            summary,
            results
        });

    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'Internal server error processing data' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
