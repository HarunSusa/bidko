import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js'; 
import aukcijaRoutes from './routes/aukcijaRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.use(cors());

// Povećaj limit za JSON i URL-encoded podatke (npr. na 50mb)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/aukcije', aukcijaRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Bidko API radi savršeno!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});