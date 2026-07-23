export const adminOnly = (req, res, next) => {
  if (req.korisnik && req.korisnik.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      poruka: 'Pristup zabranjen! Ova akcija zahtijeva administratorska prava.' 
    });
  }
};