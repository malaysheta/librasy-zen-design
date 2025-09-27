const Issue = require('../models/Issue');
const User = require('../models/User');
const Book = require('../models/Book');
const { sendBookIssueNotification, sendOverdueReminder, sendDueDateReminder } = require('./emailService');

// Send notification when a book is issued
const sendIssueNotification = async (issueId) => {
  try {
    console.log(`🔔 Attempting to send notification for issue: ${issueId}`);
    
    const issue = await Issue.findById(issueId)
      .populate('student', 'name email')
      .populate('book', 'title');

    if (!issue) {
      console.log('❌ Issue not found:', issueId);
      throw new Error('Issue not found');
    }

    const { student, book } = issue;
    console.log(`📧 Student: ${student.name}, Email: ${student.email || 'NO EMAIL'}`);
    console.log(`📚 Book: ${book.title}`);
    
    if (student.email && student.email.trim() !== '') {
      console.log(`📤 Sending notification to: ${student.email}`);
      await sendBookIssueNotification(
        student.email,
        student.name,
        book.title,
        issue.dueDate
      );
      console.log(`✅ Issue notification sent for book: ${book.title} to ${student.name}`);
    } else {
      console.log(`❌ No email found for student: ${student.name}`);
      console.log('💡 Student needs to add email address to their profile');
    }
  } catch (error) {
    console.error('❌ Error sending issue notification:', error.message);
    console.error('Full error:', error);
  }
};

// Check and send overdue reminders
const checkAndSendOverdueReminders = async () => {
  try {
    console.log('Checking for overdue books...');
    
    const overdueIssues = await Issue.find({
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: new Date() },
      isActive: true
    }).populate('student', 'name email').populate('book', 'title');

    console.log(`Found ${overdueIssues.length} overdue books`);

    for (const issue of overdueIssues) {
      // Update status to overdue if not already
      if (issue.status !== 'overdue') {
        issue.status = 'overdue';
        await issue.save();
      }

      // Calculate fine
      const fineAmount = issue.calculateFine();
      
      // Send reminder if student has email
      if (issue.student.email) {
        const daysOverdue = Math.ceil((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24));
        
        await sendOverdueReminder(
          issue.student.email,
          issue.student.name,
          issue.book.title,
          daysOverdue,
          fineAmount
        );
        
        console.log(`Overdue reminder sent for book: ${issue.book.title} to ${issue.student.name}`);
      }
    }
  } catch (error) {
    console.error('Error checking overdue books:', error);
  }
};

// Check and send due date reminders (1 day before due date)
const checkAndSendDueDateReminders = async () => {
  try {
    console.log('Checking for books due tomorrow...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const issuesDueTomorrow = await Issue.find({
      status: 'issued',
      dueDate: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      },
      isActive: true
    }).populate('student', 'name email').populate('book', 'title');

    console.log(`Found ${issuesDueTomorrow.length} books due tomorrow`);

    for (const issue of issuesDueTomorrow) {
      if (issue.student.email) {
        await sendDueDateReminder(
          issue.student.email,
          issue.student.name,
          issue.book.title,
          issue.dueDate
        );
        
        console.log(`Due date reminder sent for book: ${issue.book.title} to ${issue.student.name}`);
      }
    }
  } catch (error) {
    console.error('Error checking due date reminders:', error);
  }
};

// Get notification data for a student
const getStudentNotifications = async (studentId) => {
  try {
    const issues = await Issue.find({
      student: studentId,
      status: { $in: ['issued', 'overdue'] },
      isActive: true
    }).populate('book', 'title author coverImage');

    const notifications = issues.map(issue => {
      const isOverdue = issue.status === 'overdue' || new Date() > issue.dueDate;
      const daysUntilDue = Math.ceil((issue.dueDate - new Date()) / (1000 * 60 * 60 * 24));
      const daysOverdue = isOverdue ? Math.ceil((new Date() - issue.dueDate) / (1000 * 60 * 60 * 24)) : 0;
      const fineAmount = issue.calculateFine();

      return {
        id: issue._id,
        bookTitle: issue.book.title,
        bookAuthor: issue.book.author,
        bookCover: issue.book.coverImage,
        dueDate: issue.dueDate,
        isOverdue,
        daysUntilDue: isOverdue ? 0 : daysUntilDue,
        daysOverdue,
        fineAmount,
        status: issue.status,
        priority: isOverdue ? 'high' : (daysUntilDue <= 1 ? 'medium' : 'low')
      };
    });

    // Sort by priority (overdue first, then by days until due)
    notifications.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      if (a.isOverdue && b.isOverdue) return b.daysOverdue - a.daysOverdue;
      return a.daysUntilDue - b.daysUntilDue;
    });

    return notifications;
  } catch (error) {
    console.error('Error getting student notifications:', error);
    throw error;
  }
};

// Update fine amounts for all overdue books
const updateFineAmounts = async () => {
  try {
    console.log('Updating fine amounts for overdue books...');
    
    const overdueIssues = await Issue.find({
      status: { $in: ['issued', 'overdue'] },
      dueDate: { $lt: new Date() },
      isActive: true
    });

    for (const issue of overdueIssues) {
      const fineAmount = issue.calculateFine();
      if (issue.fineAmount !== fineAmount) {
        issue.fineAmount = fineAmount;
        issue.status = 'overdue';
        await issue.save();
      }
    }

    console.log(`Updated fine amounts for ${overdueIssues.length} overdue books`);
  } catch (error) {
    console.error('Error updating fine amounts:', error);
  }
};

module.exports = {
  sendIssueNotification,
  checkAndSendOverdueReminders,
  checkAndSendDueDateReminders,
  getStudentNotifications,
  updateFineAmounts
};
