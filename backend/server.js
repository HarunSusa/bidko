import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// Učitavanje eksternih varijabli
dotenv.config();

// Povezivanje sa MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Omogućava serveru da čita JSON podatke

// Osnovna ruta za test
app.get('/', (req, res) => {
  res.send('Bidko API radi savršeno!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
});