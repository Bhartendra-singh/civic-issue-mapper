// ml-service ka base URL. Function hai taaki har call par fresh env padhe.
// Last ka "/" hata dete hain, taaki URL me "//" na bane.
const getMlServiceUrl = () =>
    (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, '');


export const clusterActiveReports = async (reports) => {
    try {
        const response = await fetch(`${getMlServiceUrl()}/cluster-reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reports: reports.map((r) => ({
                    id: r._id.toString(),
                    category: r.category,
                    lat: r.location.lat,
                    lng: r.location.lng,
                })),
            }),
            // Cold start ke liye lamba timeout (cron background me chalta hai)
            signal: AbortSignal.timeout(60000),
        });

        if (!response.ok) {
            throw new Error(`ML service responded with status ${response.status}`);
        }

        const data = await response.json();
        return data.clusters;

    } catch (error) {
        console.error('Clustering service error:', error.message);
        return {};
    }
};


export const suggestCategory = async (description) => {
    try {
        const response = await fetch(`${getMlServiceUrl()}/suggest-category`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description }),
            // User form bhar raha hai, zyada intezaar nahi karwa sakte
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`ML service responded with status ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Category suggestion service error:', error.message);
        return null;
    }
};