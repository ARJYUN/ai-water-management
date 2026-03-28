CREATE DATABASE IF NOT EXISTS water_ai_db;
USE water_ai_db;

CREATE TABLE IF NOT EXISTS stakeholders (
  userID VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255),
  role ENUM('Admin','DevOps Engineer','Sustainability Officer','Viewer'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_workloads (
  workloadID VARCHAR(36) PRIMARY KEY,
  type ENUM('training','inference','scaling'),
  status ENUM('Submitted','Queued','Executing','Completed','Failed','Aborted','PausedForOptimization','Deferred'),
  region VARCHAR(100),
  retry_count INT DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_usage_metrics (
  metricID VARCHAR(36) PRIMARY KEY,
  workloadID VARCHAR(36),
  freshwater_liters DOUBLE,
  region VARCHAR(100),
  source ENUM('AI Data Center','Cooling Subsystem','Cloud Infrastructure'),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workloadID) REFERENCES ai_workloads(workloadID)
);

CREATE TABLE IF NOT EXISTS water_policies (
  policyID VARCHAR(36) PRIMARY KEY,
  region VARCHAR(100),
  threshold_liters DOUBLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alerts (
  alertID VARCHAR(36) PRIMARY KEY,
  workloadID VARCHAR(36),
  message TEXT,
  triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workloadID) REFERENCES ai_workloads(workloadID)
);

CREATE TABLE IF NOT EXISTS reports (
  reportID VARCHAR(36) PRIMARY KEY,
  generated_by VARCHAR(36),
  content TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_by) REFERENCES stakeholders(userID)
);
