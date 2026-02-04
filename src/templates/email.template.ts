export const getEmailTemplate = (title: string, message: string, type: string) => {
  const getThemeColor = () => {
    switch (type) {
      case 'NOTICE':
        return '#3B82F6';
      case 'ASSESSMENT':
        return '#10B981';
      case 'ISSUE':
        return '#F59E0B';
      case 'SYSTEM':
        return '#8B5CF6';
      default:
        return '#6B7280';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'NOTICE':
        return '📢';
      case 'ASSESSMENT':
        return '📝';
      case 'ISSUE':
        return '⚠️';
      case 'SYSTEM':
        return '🔔';
      default:
        return '📬';
    }
  };

  const color = getThemeColor();
  const icon = getIcon();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .content {
            padding: 40px 30px;
        }
        .message {
            background: #f9fafb;
            padding: 24px;
            border-radius: 8px;
            border-left: 4px solid ${color};
            margin: 20px 0;
        }
        .message p {
            color: #374151;
            line-height: 1.6;
            font-size: 16px;
        }
        .footer {
            background: #f9fafb;
            padding: 24px 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            color: #6b7280;
            font-size: 14px;
        }
        .footer a {
            color: ${color};
            text-decoration: none;
            font-weight: 500;
        }
        .btn {
            display: inline-block;
            background: ${color};
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            margin-top: 20px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        @media (max-width: 600px) {
            .header {
                padding: 20px;
            }
            .content {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="icon">${icon}</div>
            <h1>${title}</h1>
            <p>YourCR - Class Representative Management System</p>
        </div>
        <div class="content">
            <div class="message">
                <p>${message}</p>
            </div>
            <a href="#" class="btn">View Details</a>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} YourCR. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>Need help? <a href="#">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
  `;
};
