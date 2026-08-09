import express from 'express';
import { registracija, login, verifikujEmail, posaljiPonovoKod } from '../controllers/authController.js';

const router = express.Router();

// Ruta za registraciju: POST http://localhost:5000/api/auth/registracija
router.post('/registracija', registracija);

// Ruta za verifikaciju e-maila kôdom: POST http://localhost:5000/api/auth/verifikuj-email
router.post('/verifikuj-email', verifikujEmail);

// Ruta za login: POST http://localhost:5000/api/auth/login
router.post('/login', login);

router.post('/posalji-ponovo-kod', posaljiPonovoKod);
export default router;