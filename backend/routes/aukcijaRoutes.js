import express from 'express';
import { kreirajAukciju, preuzmiAukcije, dodajPonudu} from '../controllers/aukcijaController.js';
import { zastitiRutu } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta za kreiranje aukcije (ZAŠTIĆENA): POST http://localhost:5000/api/aukcije
router.post('/', zastitiRutu, kreirajAukciju);

// Ruta za listanje svih aukcija (JAVNA): GET http://localhost:5000/api/aukcije
router.get('/', preuzmiAukcije);

router.post('/:aukcijaId/ponuda', zastitiRutu, dodajPonudu);
export default router;