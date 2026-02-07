# Automatic Class Status Update System

## 📋 Overview

এই system automatically class এর status update করে time অনুযায়ী:

- **SCHEDULED** → **ONGOING** (যখন startTime হয়)
- **ONGOING** → **COMPLETED** (যখন endTime হয়)

## ✨ Features

### 1. **Automatic Status Transitions**

- ✅ Class শুরু হলে automatic **ONGOING** status
- ✅ Class শেষ হলে automatic **COMPLETED** status
- ✅ Status change হলে students দের notification যায়

### 2. **Smart Scheduling**

- ✅ Class create করলে automatic schedule হয়
- ✅ Class time update করলে reschedule হয়
- ✅ Server restart হলে সব pending updates reschedule হয়

### 3. **Notifications**

- ✅ Status change হলে real-time notification
- ✅ Email notification
- ✅ In-app notification

## 🏗️ Architecture

```
Class Created
    ↓
Schedule Status Updates
    ↓
At Start Time → Update to ONGOING → Send Notification
    ↓
At End Time → Update to COMPLETED → Send Notification
```

## 📁 Files Created

1. **`src/queues/classStatus.queue.ts`** - Status update queue
2. **`src/workers/classStatus.worker.ts`** - Status update worker
3. **`src/utils/classStatusScheduler.utils.ts`** - Reschedule utility

## 📝 Files Modified

1. **`src/queues/queue.config.ts`** - Added CLASS_STATUS queue
2. **`src/modules/class/class.service.ts`** - Schedule status updates
3. **`src/server.ts`** - Start worker & reschedule on startup

## 🔧 How It Works

### Class Creation Flow

```typescript
1. CR creates a class with startTime and endTime
2. Class saved to database with status = SCHEDULED
3. Two jobs scheduled:
   - Job 1: Update to ONGOING at startTime
   - Job 2: Update to COMPLETED at endTime
4. At scheduled time, worker updates status and sends notification
```

### Status Update Flow

```typescript
1. Scheduled time arrives
2. Worker checks if class exists and not cancelled
3. Updates status in database
4. Sends notification to all students
5. Job marked as completed
```

### Server Restart Flow

```typescript
1. Server starts
2. Queries all SCHEDULED and ONGOING classes
3. Reschedules status updates for each class
4. No status updates are missed
```

## 💻 Code Examples

### Creating a Class (Auto-schedules status updates)

```typescript
const classItem = await ClassService.createClass({
  subjectId: '...',
  classDate: '2026-02-08',
  startTime: '10:00 AM',
  endTime: '11:00 AM',
  createdById: 'cr-id',
  batchId: 'batch-id',
});

// Automatically scheduled:
// - ONGOING at 10:00 AM
// - COMPLETED at 11:00 AM
```

### Updating Class Time (Auto-reschedules)

```typescript
await ClassService.updateClass(classId, {
  startTime: '11:00 AM',
  endTime: '12:00 PM',
});

// Old schedules cancelled
// New schedules created:
// - ONGOING at 11:00 AM
// - COMPLETED at 12:00 PM
```

## 🎯 Status Transitions

| From      | To        | When         | Notification                                   |
| --------- | --------- | ------------ | ---------------------------------------------- |
| SCHEDULED | ONGOING   | At startTime | "🟢 Your class has started! Join now."         |
| ONGOING   | COMPLETED | At endTime   | "✅ Class has ended. Thank you for attending!" |
| Any       | CANCELLED | Manual       | No auto-update                                 |

## ⚙️ Configuration

### Timing

- Status updates happen **exactly** at startTime and endTime
- Uses BullMQ delayed jobs for precision
- Timezone-aware (uses server timezone)

### Queue Settings

```typescript
{
  jobId: `${classId}-ongoing`,  // Prevents duplicates
  delay: startDelay,            // Milliseconds until startTime
}
```

## 🐛 Troubleshooting

### Problem: Status না বদলানো

**Check:**

1. Worker running? Look for "Class status worker" in logs
2. Redis connection OK?
3. Class cancelled? (Cancelled classes skip auto-update)

**Solution:**

```bash
# Check Redis queue
redis-cli KEYS "bull:class-status:*"

# Check scheduled jobs
redis-cli LLEN "bull:class-status:delayed"
```

### Problem: Duplicate status updates

**Solution:**

- Uses unique `jobId` to prevent duplicates
- If you see duplicates, clear queue:

```bash
redis-cli DEL "bull:class-status:delayed"
```

### Problem: Server restart করার পর status update হয় না

**Solution:**

- Automatically reschedules on startup
- Check logs for "Rescheduling class status updates"
- Verify classes are SCHEDULED or ONGOING

## 🧪 Testing

### Test Automatic Status Update

#### Option 1: Create a class starting soon

```bash
# Create class starting in 2 minutes
POST /api/classes
{
  "classDate": "2026-02-07",
  "startTime": "12:45 PM",  # Current time + 2 minutes
  "endTime": "12:47 PM",    # Current time + 4 minutes
  ...
}

# Wait 2 minutes
# Check: Status should be ONGOING

# Wait 2 more minutes
# Check: Status should be COMPLETED
```

#### Option 2: Check Redis queue

```bash
# See scheduled jobs
redis-cli KEYS "bull:class-status:*"

# See job details
redis-cli HGETALL "bull:class-status:{classId}-ongoing"
```

#### Option 3: Manual trigger (for testing)

```typescript
// In your code
import { scheduleClassStatusUpdate } from './queues/classStatus.queue';

// Schedule for 10 seconds from now
const now = new Date();
const startTime = new Date(now.getTime() + 10000);
const endTime = new Date(now.getTime() + 20000);

await scheduleClassStatusUpdate(classId, startTime, endTime);
```

## 📊 Monitoring

### Worker Logs

```
🔄 Processing class status update for abc-123
   New Status: ONGOING
   Scheduled For: 2026-02-07T10:00:00
✅ Class abc-123 status updated to ONGOING
📧 Notification sent for class status change
```

### Redis Monitoring

```bash
# Count pending jobs
redis-cli LLEN "bull:class-status:waiting"

# Count delayed jobs (scheduled)
redis-cli LLEN "bull:class-status:delayed"

# Count completed jobs
redis-cli LLEN "bull:class-status:completed"

# Count failed jobs
redis-cli LLEN "bull:class-status:failed"
```

## 🔐 Edge Cases Handled

1. **Class Cancelled**: Auto-update skipped
2. **Class Deleted**: Auto-update skipped
3. **Server Restart**: Jobs rescheduled automatically
4. **Time Changed**: Old jobs cancelled, new jobs scheduled
5. **Duplicate Jobs**: Prevented by unique jobId

## 🎉 Benefits

1. ✅ **Zero Manual Work** - Fully automatic
2. ✅ **Accurate** - Updates exactly at scheduled time
3. ✅ **Reliable** - Survives server restarts
4. ✅ **Scalable** - Queue-based architecture
5. ✅ **User-Friendly** - Students get real-time updates

## 📞 Support

### Common Issues

**Q: Status update হয় না**
A: Check worker logs, Redis connection, and class status

**Q: Notification যায় না**
A: Check notification worker and email worker

**Q: Server restart এর পর কাজ করে না**
A: Check startup logs for "Rescheduling class status updates"

### Debug Commands

```bash
# Check all queues
redis-cli KEYS "bull:*"

# Clear specific queue (⚠️ Development only!)
redis-cli DEL "bull:class-status:delayed"

# Monitor Redis in real-time
redis-cli MONITOR
```

## 🚀 Future Enhancements

Possible improvements:

- [ ] Manual status override with reason
- [ ] Status history tracking
- [ ] Attendance marking on COMPLETED
- [ ] Analytics dashboard for class completion rates
