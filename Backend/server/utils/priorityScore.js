const CATEGORY_WEIGHTS = {
    pothole: 1.0,
    waterlogging: 0.8,
    drain: 0.7,
    streetlight: 0.6,
    garbage: 0.5,
    other: 0.4,
};

export const calculatePriorityScore = (report) => {
    const categoryWeight = CATEGORY_WEIGHTS[report.category] ?? 0.4;

    const ageInDays = (Date.now() - report.createdAt.getTime()) / (1000 * 60 * 60 * 24);

    const categoryScore = categoryWeight * 40;
    const upvoteScore = Math.min(report.upvoteCount, 10) * 3;
    const ageScore = Math.min(ageInDays, 30) * 2;

    return Math.round(categoryScore + upvoteScore + ageScore);
};