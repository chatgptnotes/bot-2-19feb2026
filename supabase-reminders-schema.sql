-- Automated Reminders Table
CREATE TABLE automated_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  time TIME NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'once')),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'System', 'email', 'sms')),
  enabled BOOLEAN DEFAULT true,
  icon TEXT DEFAULT 'Bell',
  position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample data matching current reminders
INSERT INTO automated_reminders (title, description, time, frequency, channel, position) VALUES
('Morning Wake-up Reminder', 'Good morning Dr. Murali! 😊 Time to wake up. Don''t forget your 7 AM medicines in one hour.', '06:00', 'daily', 'whatsapp', 1),

('Morning Email & WhatsApp Check', 'Check all unread emails and WhatsApp messages. Summarize urgent items and reply to WhatsApp messages. Check NABH accreditation progress.', '06:15', 'daily', 'System', 2),

('Morning Medicine Reminder', '💊 Medicine time, Dr. Murali! Please take your morning medications now.', '07:00', 'daily', 'whatsapp', 3),

('Pre-Huddle Hospital Occupancy & NABH Check', 'Check current bed occupancy at Ayushman Nagpur Hospital and Hope Hospital. Report status before 9 AM morning huddle. Confirm if Dr. Murali has completed his workout. Provide NABH accreditation daily update for Hope Hospital.', '08:30', 'daily', 'System', 4),

('Midday Email & WhatsApp Check', 'Check and reply to all WhatsApp messages. Check urgent emails. Update on NABH accreditation progress. Report any urgent matters to Dr. Murali.', '14:00', 'daily', 'System', 5),

('11 AM Meeting Reminder (WhatsApp)', '📅 Reminder: Meeting at 11:00 AM in 15 minutes', '10:45', 'daily', 'whatsapp', 6),

('4 PM Meeting Reminder (WhatsApp)', '📅 Reminder: Meeting at 4:00 PM in 15 minutes', '15:45', 'daily', 'whatsapp', 7),

('End of Day Summary', 'Provide end-of-day summary: WhatsApp messages handled, emails checked, NABH accreditation progress for Hope Hospital, hospital status, pending tasks for tomorrow. Send summary via WhatsApp.', '20:00', 'daily', 'System', 8);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_automated_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_automated_reminders_timestamp BEFORE UPDATE ON automated_reminders
FOR EACH ROW EXECUTE FUNCTION update_automated_reminders_updated_at();

-- Create index for faster queries
CREATE INDEX idx_automated_reminders_time ON automated_reminders(time);
CREATE INDEX idx_automated_reminders_enabled ON automated_reminders(enabled);
