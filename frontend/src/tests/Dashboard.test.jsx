import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import Dashboard from '../pages/Dashboard';
import React from 'react';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn((url) => {
      if (url === '/analytics/summary') return Promise.resolve({ data: { total_water_liters: 5000, total_workloads: 10, active_workloads: 2, total_alerts: 1 } });
      if (url === '/analytics/trends') return Promise.resolve({ data: [] });
      if (url === '/alerts') return Promise.resolve({ data: [] });
      return Promise.reject(new Error('not found'));
    }),
  },
}));

test('renders Dashboard title and stat cards', async () => {
  render(<Dashboard />);
  
  // Check if title is rendered
  expect(screen.getByText(/Dashboard/i)).toBeDefined();
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/Loading dashboard.../i)).toBeNull();
  });

  // Check for stat cards values
  expect(screen.getByText(/5.0K L/i)).toBeDefined(); // (5000 / 1000).toFixed(1) + 'K L'
  expect(screen.getByText(/10/i)).toBeDefined();
});
