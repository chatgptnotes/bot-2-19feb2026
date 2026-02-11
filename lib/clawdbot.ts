import fs from 'fs';
import path from 'path';

const CLAWDBOT_PATH = '/Users/murali/.openclaw/workspace';
const CRON_PATH = '/Users/murali/.clawdbot/cron';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: string;
  time?: string;
}

export interface CronJob {
  id: string;
  name: string;
  schedule: string;
  timezone: string;
  action: {
    type: string;
    channel?: string;
    message?: string;
    prompt?: string;
  };
}

export interface DailySchedule {
  time: string;
  task: string;
  type: 'reminder' | 'meeting' | 'check' | 'health';
  status: 'pending' | 'completed';
}

export function readHeartbeat(): Task[] {
  try {
    const heartbeatPath = path.join(CLAWDBOT_PATH, 'HEARTBEAT.md');
    const content = fs.readFileSync(heartbeatPath, 'utf-8');

    const tasks: Task[] = [];
    const lines = content.split('\n');
    let category = 'General';

    lines.forEach((line, index) => {
      if (line.startsWith('## ')) {
        category = line.replace('## ', '').trim();
      } else if (line.includes('- [ ]')) {
        const title = line.replace('- [ ]', '').trim();
        tasks.push({
          id: `task-${index}`,
          title,
          description: '',
          completed: false,
          category,
        });
      } else if (line.includes('- [x]')) {
        const title = line.replace('- [x]', '').trim();
        tasks.push({
          id: `task-${index}`,
          title,
          description: '',
          completed: true,
          category,
        });
      }
    });

    return tasks;
  } catch {
    return [];
  }
}

export function readCronJobs(): CronJob[] {
  try {
    const cronPath = path.join(CRON_PATH, 'jobs.json');
    const content = fs.readFileSync(cronPath, 'utf-8');
    const data = JSON.parse(content);
    const jobs = data.jobs || [];

    // Normalize job format - handle both old and new formats
    return jobs.map((job: any) => {
      // Handle schedule format - can be string or object
      let schedule = job.schedule;
      if (typeof schedule === 'object' && schedule !== null) {
        if (schedule.kind === 'cron') {
          schedule = schedule.expr || 'Not scheduled';
        } else if (schedule.kind === 'at') {
          schedule = 'One-time task';
        } else if (schedule.kind === 'every') {
          schedule = `Every ${Math.floor(schedule.everyMs / 60000)} minutes`;
        } else {
          schedule = 'Not scheduled';
        }
      }

      // Handle action/payload format
      let action = job.action;
      if (!action && job.payload) {
        // New format uses payload instead of action
        action = {
          type: job.payload.kind || 'systemEvent',
          message: job.payload.text || '',
          prompt: job.payload.text || '',
        };
      }

      // Ensure action exists with defaults
      if (!action) {
        action = {
          type: 'unknown',
          message: job.name || 'Automated task',
          prompt: job.name || 'Automated task',
        };
      }

      return {
        id: job.id,
        name: job.name || 'Unnamed task',
        schedule: schedule,
        timezone: job.timezone || 'Asia/Kolkata',
        action: action,
      };
    });
  } catch {
    return [];
  }
}

export function getDailySchedule(): DailySchedule[] {
  return [
    { time: '06:00', task: 'Wake up reminder', type: 'reminder', status: 'pending' },
    { time: '07:00', task: 'Morning medicines', type: 'health', status: 'pending' },
    { time: '07:30', task: '1 hour workout', type: 'health', status: 'pending' },
    { time: '08:30', task: 'Hospital occupancy check', type: 'check', status: 'pending' },
    { time: '09:00', task: 'Morning huddle at hospital', type: 'meeting', status: 'pending' },
    { time: '11:00', task: 'Meeting', type: 'meeting', status: 'pending' },
    { time: '16:00', task: 'Meeting', type: 'meeting', status: 'pending' },
  ];
}

export function getUserProfile() {
  try {
    const userPath = path.join(CLAWDBOT_PATH, 'USER.md');
    const content = fs.readFileSync(userPath, 'utf-8');
    return {
      name: 'Dr. Murali BK',
      role: 'Orthopedic Surgeon',
      hospitals: ['Ayushman Nagpur Hospital', 'Hope Hospital'],
      company: 'DocDRM',
      projects: 50,
    };
  } catch {
    return null;
  }
}
