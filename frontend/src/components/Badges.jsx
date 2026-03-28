import React from 'react';

const statusConfig = {
  'Submitted':             { cls: 'badge-gray',   label: 'Submitted' },
  'Queued':                { cls: 'badge-amber',  label: 'Queued' },
  'Executing':             { cls: 'badge-blue',   label: 'Executing' },
  'Completed':             { cls: 'badge-green',  label: 'Completed' },
  'Failed':                { cls: 'badge-red',    label: 'Failed' },
  'Aborted':               { cls: 'badge-red',    label: 'Aborted' },
  'PausedForOptimization': { cls: 'badge-purple', label: 'Paused' },
  'Deferred':              { cls: 'badge-cyan',   label: 'Deferred' },
};

const typeConfig = {
  training:  { cls: 'badge-purple', label: 'Training' },
  inference: { cls: 'badge-cyan',   label: 'Inference' },
  scaling:   { cls: 'badge-amber',  label: 'Scaling' },
};

const regionConfig = {
  'us-central':  { flag: '🇺🇸', label: 'US Central' },
  'asia-east':   { flag: '🇯🇵', label: 'Asia East' },
  'europe-west': { flag: '🇩🇪', label: 'Europe West' },
};

export function StatusBadge({ status }) {
  const cfg = statusConfig[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

export function TypeBadge({ type }) {
  const cfg = typeConfig[type] || { cls: 'badge-gray', label: type };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}

export function RegionBadge({ region }) {
  const cfg = regionConfig[region] || { flag: '🌍', label: region };
  return <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{cfg.flag} {cfg.label}</span>;
}
