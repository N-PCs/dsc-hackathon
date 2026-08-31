import 'dotenv/config';
import app from './src/app.js';

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Origin Hackathon Backend running at http://localhost:${PORT}`);
});