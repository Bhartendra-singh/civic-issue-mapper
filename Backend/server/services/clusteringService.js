export const clusterActiveReports = async (reports) => {
    try {
        const response = await fetch('http://localhost:8000/cluster-reports', {
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
        });

        const data = await response.json();
        return data.clusters;

    } catch (error) {
        console.error('Clustering service error:', error.message);
        return {};
    }
};