require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  for (const key of ['MONGO_URI', 'JWT_SECRET']) {
    if (!process.env[key]) {
      console.error(`Missing required environment variable: ${key}`);
      process.exit(1);
    }
  }

  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
