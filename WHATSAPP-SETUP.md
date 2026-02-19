# WhatsApp Integration Setup Guide

## Status: ✅ READY FOR CONFIGURATION

The WhatsApp integration has been successfully implemented using Twilio API. You just need to add your Twilio credentials to start sending messages.

## What's Been Implemented

### 1. API Routes Created
- **`/api/whatsapp/send`** - Send WhatsApp messages
  - POST: Send a message
  - GET: Check configuration status

- **`/api/whatsapp/test`** - Send test message
  - GET: Send a test WhatsApp message to verify setup

- **`/api/whatsapp/scheduler`** - Automated scheduler
  - GET: Check and send scheduled reminders
  - POST: Manually trigger a specific reminder

### 2. Settings Page Updated
- Real-time WhatsApp configuration status
- One-click test message button
- Visual indicators for each credential
- Setup instructions displayed when not configured

### 3. Package Installed
- `twilio` package added to dependencies

## Setup Instructions

### Step 1: Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com)
2. Sign up or log in
3. Get your **Account SID** and **Auth Token** from the dashboard
4. Enable WhatsApp on your Twilio account
5. Get your Twilio WhatsApp number (sandbox or approved number)

### Step 2: Update Environment Variables

Edit `/Users/murali/1backup/Bot/.env.local`:

```env
# Replace these values with your actual Twilio credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TWILIO_TO_WHATSAPP_NUMBER=whatsapp:+919876543210
```

**Notes:**
- `TWILIO_WHATSAPP_NUMBER`: Your Twilio WhatsApp sender number (from Twilio)
- `TWILIO_TO_WHATSAPP_NUMBER`: Dr. Murali's WhatsApp number (recipient)
- Both numbers must include `whatsapp:` prefix
- Phone numbers must be in E.164 format (+country code + number)

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Test Integration

1. Open http://localhost:3001/settings
2. Check the "WhatsApp Integration" section
3. Click "Send Test Message"
4. You should receive a test message on WhatsApp

## Usage Examples

### Send a Message via API

```javascript
const response = await fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello from OpenClaw!'
  })
});
```

### Send to Different Number

```javascript
const response = await fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    to: 'whatsapp:+919876543210'
  })
});
```

### Check Configuration

```javascript
const response = await fetch('/api/whatsapp/send');
const status = await response.json();
console.log(status.configured); // true/false
```

## Automated Reminders

The system automatically checks for scheduled reminders every minute using the scheduler API.

To enable automated sending:

1. Add reminders in the `/reminders` page
2. Set channel to "whatsapp"
3. Set the time (e.g., "07:00")
4. Enable the reminder

The scheduler will automatically send WhatsApp messages at the specified times.

## Database Schema

The system uses these Supabase tables:
- `automated_reminders` - Stores scheduled reminders
- `reminder_logs` - Logs all sent reminders (will be created automatically)

## Troubleshooting

### Error: "WhatsApp not configured"
- Check that all TWILIO_* variables are set in .env.local
- Restart the dev server after changing env variables

### Error: "Invalid phone number"
- Ensure numbers are in E.164 format: `whatsapp:+919876543210`
- Include country code without leading zeros

### Messages Not Sending
- Verify your Twilio account is active
- Check Twilio console for error logs
- Ensure you've joined the Twilio WhatsApp sandbox (if using sandbox)

### Twilio WhatsApp Sandbox
If you're testing with Twilio sandbox:
1. Send a message to your Twilio sandbox number
2. Reply with the join code (e.g., "join abc-xyz")
3. Now the sandbox can send you messages

## Next Steps

1. **Get Twilio credentials** from console.twilio.com
2. **Update .env.local** with your credentials
3. **Restart server** and test
4. **Schedule reminders** for HEARTBEAT.md schedule
5. **Monitor logs** in Settings page

## Security Notes

- Never commit `.env.local` to git (already in .gitignore)
- Keep your Twilio credentials secure
- Rotate auth tokens periodically
- Use Twilio's environment-specific credentials for production

## Cost Considerations

- Twilio WhatsApp messages cost approximately $0.005 per message
- Monitor usage in Twilio console
- Set up billing alerts in Twilio account

---

**Implementation Date:** 2025-02-12
**Status:** Ready for Twilio credential configuration
**Next Action:** Add Twilio credentials to .env.local
