# Email & Reminder System Documentation

## 📧 Overview

এই সিস্টেম **automatic email notifications** এবং **scheduled reminders** provide করে class এবং assessment এর জন্য।

## ✨ Features

### 1. **Class Notifications**

- ✅ **Create হলে**: সব student দের কাছে immediate email + notification যায়
- ✅ **Update হলে**: যদি class এর date, time, status বা type change হয়, তাহলে notification যায়
- ✅ **1 Hour Before Reminder**: Class শুরু হওয়ার 1 ঘন্টা আগে automatic reminder

### 2. **Assessment Notifications**

- ✅ **Create হলে**: সব student দের কাছে immediate email + notification যায়
- ✅ **Update হলে**: যদি title, deadline বা description change হয়, তাহলে notification যায়
- ✅ **1 Day Before Reminder**: Deadline এর 1 দিন আগে সকাল 9 টায় automatic reminder

## 🏗️ Architecture

### Queue System

```
┌─────────────────┐
│  Class/         │
│  Assessment     │
│  Service        │
└────────┬────────┘
         │
         ├──────────────────────────────────┐
         │                                  │
         ▼                                  ▼
┌────────────────────┐          ┌────────────────────┐
│ Notification Queue │          │  Reminder Queue    │
│  (Immediate)       │          │  (Scheduled)       │
└────────┬───────────┘          └────────┬───────────┘
         │                               │
         ▼                               ▼
┌────────────────────┐          ┌────────────────────┐
│ Notification       │          │  Reminder Worker   │
│ Worker             │          │                    │
└────────┬───────────┘          └────────┬───────────┘
         │                               │
         ├───────────────────────────────┘
         │
         ▼
┌────────────────────┐
│   Email Queue      │
└────────┬───────────┘
         │
         ▼
┌────────────────────┐
│   Email Worker     │
│   (Send Email)     │
└────────────────────┘
```

### Files Created/Modified

#### **New Files:**

1. `src/queues/reminder.queue.ts` - Reminder queue এবং scheduling functions
2. `src/workers/reminder.worker.ts` - Reminder processing worker

#### **Modified Files:**

1. `src/queues/queue.config.ts` - Added REMINDER queue name
2. `src/modules/class/class.service.ts` - Added notifications এবং reminders
3. `src/modules/assessment/assessment.service.ts` - Added notifications এবং reminders
4. `src/server.ts` - Started reminder worker

## 🔧 How It Works

### Class Creation Flow

```typescript
1. CR creates a class
2. Class saved to database
3. Immediate notification sent to all students (email + in-app)
4. Reminder scheduled for 1 hour before class starts
5. When time comes, reminder worker sends notification
```

### Assessment Creation Flow

```typescript
1. CR creates an assessment
2. Assessment saved to database
3. Immediate notification sent to all students (email + in-app)
4. Reminder scheduled for 1 day before deadline at 9 AM
5. When time comes, reminder worker sends notification
```

### Update Flow

```typescript
1. CR updates class/assessment
2. System detects what changed
3. Notification sent with change details
4. If time/deadline changed, new reminder scheduled
```

## 📝 Code Examples

### Scheduling Class Reminder

```typescript
await scheduleClassReminder(
  classItem.id,
  new Date(classItem.startTime),
  classItem.subject?.name || 'Class',
  payload.createdById
);
```

### Scheduling Assessment Reminder

```typescript
await scheduleAssessmentReminder(
  assessment.id,
  new Date(assessment.deadline),
  assessment.title,
  actorId
);
```

### Sending Immediate Notification

```typescript
await addNotificationJob({
  title: `New Class: ${classItem.subject?.name}`,
  message: `Class scheduled at ${startTime}`,
  type: 'NOTICE',
  relatedId: classItem.id,
  crId: payload.createdById,
});
```

## 🎯 Notification Types

| Type         | Description        | Used For                 |
| ------------ | ------------------ | ------------------------ |
| `NOTICE`     | General notices    | Class notifications      |
| `ASSESSMENT` | Assessment related | Assessment notifications |
| `SYSTEM`     | System messages    | System alerts            |
| `ISSUE`      | Issue reports      | Issue tracking           |

## ⚙️ Configuration

### Reminder Timing

- **Class Reminder**: 1 hour before start time
- **Assessment Reminder**: 1 day before deadline at 9:00 AM

### Queue Settings (in `queue.config.ts`)

```typescript
{
  attempts: 3,              // Retry 3 times if failed
  backoff: {
    type: 'exponential',    // Exponential backoff
    delay: 5000,            // Start with 5 seconds
  }
}
```

## 🐛 Troubleshooting

### Problem: Notifications না যাওয়া

**Solution:**

1. Check Redis connection: `redis-cli ping`
2. Check worker logs in terminal
3. Verify email configuration in `.env`
4. Check if user has email in database

### Problem: Reminder সময়মতো না যাওয়া

**Solution:**

1. Check if reminder worker running: Look for "Reminder worker" in logs
2. Check Redis queue: `redis-cli KEYS "bull:reminders:*"`
3. Verify system time is correct

### Problem: Duplicate notifications

**Solution:**

1. Check if multiple workers running
2. Clear Redis queue: `redis-cli FLUSHDB` (⚠️ Development only!)

## 🚀 Testing

### Test Class Notification

```bash
# Create a class via API
POST /api/classes
{
  "subjectId": "...",
  "classDate": "2026-02-08",
  "startTime": "10:00 AM",
  "endTime": "11:00 AM",
  "createdById": "cr-id",
  "batchId": "batch-id"
}

# Check:
# 1. Immediate notification in database
# 2. Email sent to students
# 3. Reminder scheduled in Redis
```

### Test Assessment Reminder

```bash
# Create assessment with deadline tomorrow
POST /api/assessments
{
  "title": "Test Assignment",
  "deadline": "2026-02-08T23:59:00",
  "createdById": "cr-id"
}

# Check Redis for scheduled job:
redis-cli KEYS "bull:reminders:*"
```

## 📊 Monitoring

### Check Queue Status

```typescript
// In Redis CLI
KEYS "bull:*"                    // All queues
LLEN "bull:reminders:waiting"    // Pending reminders
LLEN "bull:reminders:active"     // Processing reminders
LLEN "bull:reminders:completed"  // Completed reminders
LLEN "bull:reminders:failed"     // Failed reminders
```

### Worker Logs

Workers log করবে:

- ✅ Job completed
- ❌ Job failed
- ⏰ Reminder scheduled
- 📧 Email sent

## 🔐 Security Notes

1. **Email credentials**: Store in `.env`, never commit
2. **Redis**: Use password in production
3. **Rate limiting**: Already configured (10 jobs/second)

## 🎉 Benefits

1. ✅ **Automatic**: No manual intervention needed
2. ✅ **Reliable**: Retry mechanism for failures
3. ✅ **Scalable**: Queue-based architecture
4. ✅ **Flexible**: Easy to add new notification types
5. ✅ **User-friendly**: Students get timely reminders

## 📞 Support

যদি কোনো সমস্যা হয়:

1. Check logs in `./logs/` directory
2. Check Redis connection
3. Verify worker is running
4. Check email configuration
