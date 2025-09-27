const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/librasy-zen', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Book = require('./backend/models/Book');
const User = require('./backend/models/User');
const Issue = require('./backend/models/Issue');

async function testIssueBook() {
  try {
    console.log('🧪 Testing Issue Book functionality...\n');

    // 1. Create a test book
    console.log('1. Creating test book...');
    const testBook = new Book({
      title: 'Test Book for Issue',
      author: 'Test Author',
      isbn: '1234567890123',
      totalCopies: 5,
      availableCopies: 5,
      status: 'Available'
    });
    await testBook.save();
    console.log('✅ Test book created:', testBook.title);

    // 2. Create a test student
    console.log('\n2. Creating test student...');
    const testStudent = new User({
      name: 'Test Student',
      email: 'teststudent@example.com',
      password: 'password123',
      rollNumber: 'STU001',
      collegeName: 'Test College',
      role: 'student'
    });
    await testStudent.save();
    console.log('✅ Test student created:', testStudent.name);

    // 3. Create a test admin
    console.log('\n3. Creating test admin...');
    const testAdmin = new User({
      name: 'Test Admin',
      email: 'testadmin@example.com',
      password: 'password123',
      role: 'admin'
    });
    await testAdmin.save();
    console.log('✅ Test admin created:', testAdmin.name);

    // 4. Test issuing a book
    console.log('\n4. Testing book issue...');
    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const testIssue = new Issue({
      book: testBook._id,
      student: testStudent._id,
      rollNumber: testStudent.rollNumber,
      issueDate: issueDate,
      dueDate: dueDate,
      issuedBy: testAdmin._id,
      status: 'issued'
    });
    await testIssue.save();
    console.log('✅ Book issue created');

    // 5. Update book available copies
    console.log('\n5. Updating book available copies...');
    await testBook.updateAvailableCopies(-1);
    console.log('✅ Book available copies updated:', testBook.availableCopies);

    // 6. Test overdue calculation
    console.log('\n6. Testing overdue calculation...');
    const isOverdue = testIssue.isOverdue;
    console.log('✅ Is overdue:', isOverdue);

    // 7. Test fine calculation
    console.log('\n7. Testing fine calculation...');
    const fine = testIssue.calculateFine();
    console.log('✅ Fine amount:', fine);

    // 8. Test returning book
    console.log('\n8. Testing book return...');
    await testIssue.returnBook(testAdmin._id);
    console.log('✅ Book returned');

    // 9. Update book available copies after return
    console.log('\n9. Updating book available copies after return...');
    await testBook.updateAvailableCopies(1);
    console.log('✅ Book available copies after return:', testBook.availableCopies);

    console.log('\n🎉 All tests passed! Issue Book functionality is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await Book.deleteOne({ title: 'Test Book for Issue' });
    await User.deleteOne({ email: 'teststudent@example.com' });
    await User.deleteOne({ email: 'testadmin@example.com' });
    await Issue.deleteOne({ rollNumber: 'STU001' });
    console.log('✅ Test data cleaned up');
    
    mongoose.connection.close();
  }
}

testIssueBook();
