import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const zastitiRutu = async (req, res, next) => {
  let token;

  // Token šaljemo u Headers kao "Authorization: Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Izvlačimo sam token iz stringa "Bearer token_kod..."
      token = req.headers.authorization.split(' ')[1];

      // Dekodiramo token pomoću našeg tajnog ključa
      const dekodiran = jwt.verify(token, process.env.JWT_SECRET);

      // Pronalazimo korisnika u bazi na osnovu ID-ja iz tokena (bez lozinke)
      req.korisnik = await User.findById(dekodiran.id).select('-lozinka');

      // Sve je OK, pusti zahtjev na kontroler
      next();
    } catch (error) {
      return res.status(401).json({ poruka: 'Niste autorizovani, token je nevažeći.' });
    }
  }

  if (!token) {
    return res.status(401).json({ poruka: 'Niste autorizovani, nedostaje token.' });
  }
};