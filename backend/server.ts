import 'dotenv/config';
import app from './src/app.js';
import { initDatabase } from './src/config/database.js';

const PORT = Number(process.env.PORT) || 4000;

async function startServer() {
  try {
    await initDatabase(); 
    app.listen(PORT, '0.0.0.0', () => {
      console.log(` Origin Hackathon Backend running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();