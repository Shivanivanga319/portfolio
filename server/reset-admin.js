const dotenv = require('dotenv');
const { connectDB, isDBConnected } = require('./config/db');
const Admin = require('./models/Admin');

dotenv.config();

const resetAdmin = async () => {
  const newUsername = process.argv[2] || process.env.ADMIN_USERNAME || 'admin';
  const newPassword = process.argv[3] || process.env.ADMIN_PASSWORD || 'admin123';

  await connectDB();

  if (!isDBConnected()) {
    console.log('MongoDB is not currently running or connected.');
    console.log('In Local / Fallback mode, credentials are loaded directly from server/.env:');
    console.log(`Username: ${newUsername}`);
    console.log(`Password: ${newPassword}`);
    process.exit(0);
  }

  try {
    let admin = await Admin.findOne();
    if (!admin) {
      admin = new Admin({ username: newUsername, password: newPassword });
    } else {
      admin.username = newUsername;
      admin.password = newPassword;
    }
    await admin.save();
    console.log('✅ Admin credentials updated in MongoDB:');
    console.log(`Username: ${newUsername}`);
    console.log(`Password: ${newPassword}`);
    process.exit(0);
  } catch (err) {
    console.error('Error resetting admin:', err.message);
    process.exit(1);
  }
};

resetAdmin();
