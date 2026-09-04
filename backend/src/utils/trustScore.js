// Trust score feeds the search-ranking boost and reputation badges.
// R = average star rating (0-5), C = completed deals (capped at 20 so new
// sellers still stand a chance against established ones).
const computeTrustScore = (avgRating, completedDeals) => {
  const r = parseFloat(avgRating) || 0;
  const c = Math.min(completedDeals || 0, 20);
  return Math.round(r * 10) + c;
};

const updateTrustScore = async (User, userId) => {
  const user = await User.findByPk(userId, { attributes: ['avg_rating', 'total_sales'] });
  if (!user) return;
  const trust_score = computeTrustScore(user.avg_rating, user.total_sales);
  await User.update({ trust_score }, { where: { id: userId } });
};

module.exports = { computeTrustScore, updateTrustScore };
