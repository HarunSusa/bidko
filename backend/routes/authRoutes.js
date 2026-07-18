import express from 'express';
import { registracija, login } from '../controllers/authController.js';

const router = express.Router();

// Ruta za registraciju: POST http://localhost:5000/api/auth/registracija
router.post('/registracija', registracija);

// Ruta za login: POST http://localhost:5000/api/auth/login
router.post('/login', login);

export default router;