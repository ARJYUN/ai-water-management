const { calculateEstimatedLiters } = require('../../utils/waterCalculator');

describe('Water Policy Unit Tests', () => {
  test('should calculate correct liters for training in us-central', () => {
    const liters = calculateEstimatedLiters('training', 'us-central');
    expect(liters).toBe(400 * 1.1);
  });

  test('should calculate correct liters for inference in asia-east', () => {
    const liters = calculateEstimatedLiters('inference', 'asia-east');
    expect(liters).toBe(100 * 1.3);
  });

  test('should use default WUE if region is unknown', () => {
    const liters = calculateEstimatedLiters('scaling', 'unknown-region');
    expect(liters).toBe(200 * 1.1);
  });

  test('should use default kWh if type is unknown', () => {
    const liters = calculateEstimatedLiters('unknown-type', 'europe-west');
    expect(liters).toBe(200 * 0.9);
  });
});
