import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 1. REGISTRACIJA KORISNIKA
export const registracija = async (req, res) => {
  try {
    const { ime, email, lozinka, telefon } = req.body;

    // Provjeri da li korisnik već postoji sa tim emailom ili telefonom
    const korisnikPostoji = await User.findOne({ $or: [{ email }, { telefon }] });
    if (korisnikPostoji) {
      return res.status(400).json({ poruka: 'Korisnik sa tim email-om ili telefonom već postoji.' });
    }

    // Šifrovanje lozinke (Hash)
    const salt = await bcrypt.genSalt(10);
    const hesiranaLozinka = await bcrypt.hash(lozinka, salt);

    // Kreiranje novog korisnika
    const noviKorisnik = new User({
      ime,
      email,
      lozinka: hesiranaLozinka,
      telefon
    });

    await noviKorisnik.save();

    res.status(201).json({ poruka: 'Korisnik uspješno registrovan!' });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška na serveru', greska: error.message });
  }
};

// 2. LOGIN KORISNIKA
export const login = async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    // Pronađi korisnika po emailu
    const korisnik = await User.findOne({ email });
    if (!korisnik) {
      return res.status(400).json({ poruka: 'Pogrešan email ili lozinka.' });
    }

    // Provjeri da li je korisnik banovan zbog lažnih ponuda
    if (korisnik.isBanovan) {
      return res.status(403).json({ poruka: 'Vaš nalog je suspendovan zbog kršenja pravila licitacije.' });
    }

    // Provjeri da li lozinka odgovara
    const isLozinkaTacna = await bcrypt.compare(lozinka, korisnik.lozinka);
    if (!isLozinkaTacna) {
      return res.status(400).json({ poruka: 'Pogrešan email ili lozinka.' });
    }

    // Generisanje JWT Tokena koji važi 30 dana
    const token = jwt.sign(
  { id: korisnik._id, ime: korisnik.ime }, // Popravljeno: _id umjesto _index
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

    res.status(200).json({
      poruka: 'Uspješno ste se prijavili!',
      token,
      korisnik: {
        id: korisnik._id,
        ime: korisnik.ime,
        email: korisnik.email,
        kazneniPoeni: korisnik.kazneniPoeni
      }
    });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška na serveru', greska: error.message });
  }
};