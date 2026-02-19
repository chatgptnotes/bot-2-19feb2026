-- Schedule Items Table
CREATE TABLE schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time TIME NOT NULL,
  task TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('reminder', 'meeting', 'check', 'health')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data matching current schedule
INSERT INTO schedule_items (time, task, type, status) VALUES
('06:00', 'Wake up reminder', 'reminder', 'pending'),
('07:00', 'Morning medicines', 'health', 'pending'),
('07:30', '1 hour workout', 'health', 'pending'),
('08:30', 'Hospital occupancy check', 'check', 'pending'),
('09:00', 'Morning huddle at hospital', 'meeting', 'pending'),
('11:00', 'Meeting', 'meeting', 'pending'),
('16:00', 'Meeting', 'meeting', 'pending');

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  category TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Sample tasks data
INSERT INTO tasks (title, description, completed, category, priority, position) VALUES
('Review patient reports', 'Check all pending patient reports', false, 'Hospital', 'high', 1),
('Update inventory', 'Medicine inventory update needed', false, 'Hospital', 'medium', 2),
('Team meeting prep', 'Prepare agenda for weekly team meeting', true, 'Meetings', 'medium', 3),
('NABH documentation', 'Complete pending NABH audit documents', false, 'NABH', 'high', 4),
('Software deployment', 'Deploy latest updates to production', false, 'Software', 'high', 5);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    IF NEW.completed = true AND OLD.completed = false THEN
        NEW.completed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON schedule_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
