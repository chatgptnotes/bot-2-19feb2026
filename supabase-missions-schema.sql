-- Missions table for Mission Control Center
CREATE TABLE missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  icon TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  deadline DATE NOT NULL,
  current_value INTEGER NOT NULL,
  target_value INTEGER NOT NULL,
  unit TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('on-track', 'at-risk', 'delayed')),
  key_actions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial missions data
INSERT INTO missions (id, title, icon, progress, deadline, current_value, target_value, unit, status, key_actions) VALUES
('nabh', 'NABH Audit Success', 'Award', 75, '2025-03-01', 340, 450, 'criteria', 'on-track',
 '[
   {"id": "1", "text": "Complete ICU documentation", "completed": true},
   {"id": "2", "text": "Staff training sessions", "completed": true},
   {"id": "3", "text": "Equipment calibration audit", "completed": false},
   {"id": "4", "text": "Mock audit preparation", "completed": false}
 ]'::jsonb),

('occupancy', 'Hospital Occupancy', 'Users', 56, '2025-04-30', 168, 300, 'beds', 'at-risk',
 '[
   {"id": "1", "text": "Marketing campaign launch", "completed": true},
   {"id": "2", "text": "Referral doctor outreach", "completed": false},
   {"id": "3", "text": "Patient satisfaction survey", "completed": false},
   {"id": "4", "text": "Discharge process optimization", "completed": false}
 ]'::jsonb),

('revenue', 'Software Revenue', 'TrendingUp', 40, '2025-04-30', 12, 30, 'lakh', 'delayed',
 '[
   {"id": "1", "text": "Close pending leads", "completed": false},
   {"id": "2", "text": "Product demo sessions", "completed": true},
   {"id": "3", "text": "Pricing optimization", "completed": false},
   {"id": "4", "text": "Customer success program", "completed": false}
 ]'::jsonb),

('esic', 'ESIC Recovery', 'DollarSign', 65, '2025-04-30', 26, 40, 'lakh', 'on-track',
 '[
   {"id": "1", "text": "Document verification", "completed": true},
   {"id": "2", "text": "Claim submission", "completed": true},
   {"id": "3", "text": "Follow-up with ESIC office", "completed": false},
   {"id": "4", "text": "Legal documentation review", "completed": false}
 ]'::jsonb);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
