const calculateEstimatedLiters = (type, region) => {
  const kwhByType = { training: 400, inference: 100, scaling: 200 };
  const wueByRegion = { 'us-central': 1.1, 'asia-east': 1.3, 'europe-west': 0.9 };
  
  const kwh = kwhByType[type] || 200;
  const wue = wueByRegion[region] || 1.1;
  
  return kwh * wue;
};

module.exports = { calculateEstimatedLiters };
