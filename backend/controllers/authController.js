import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { posaljiVerifikacijskiEmail } from '../utils/emailService.js';

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

    // Generisanje 6-cifrenog koda i postavljanje trajanja (15 minuta)
    const kod = Math.floor(100000 + Math.random() * 900000).toString();
    const kodIstice = new Date(Date.now() + 15 * 60 * 1000);

    // Kreiranje novog korisnika
    const noviKorisnik = new User({
      ime,
      email,
      lozinka: hesiranaLozinka,
      telefon,
      isVerifikovan: false,
      verifikacijskiKod: kod,
      kodIstice: kodIstice
    });

    await noviKorisnik.save();

    // Slanje e-maila sa verifikacijskim kodom
    try {
      await posaljiVerifikacijskiEmail(email, ime, kod);
    } catch (emailError) {
      console.error('Greška pri slanju verifikacijskog e-maila:', emailError);
    }

    res.status(201).json({ 
      poruka: 'Registracija uspješna! Poslali smo verifikacijski kod na vaš e-mail.',
      email: noviKorisnik.email 
    });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška na serveru', greska: error.message });
  }
};

// 2. VERIFIKACIJA E-MAILA
export const verifikujEmail = async (req, res) => {
  try {
    const { email, kod } = req.body;

    const korisnik = await User.findOne({ email });
    if (!korisnik) {
      return res.status(404).json({ poruka: 'Korisnik nije pronađen.' });
    }

    if (korisnik.isVerifikovan) {
      return res.status(400).json({ poruka: 'Vaš nalog je već verifikovan.' });
    }

    if (korisnik.verifikacijskiKod !== kod) {
      return res.status(400).json({ poruka: 'Uneseni verifikacijski kod je netačan.' });
    }

    if (new Date() > korisnik.kodIstice) {
      return res.status(400).json({ poruka: 'Verifikacijski kod je istekao. Zatražite novi.' });
    }

    // Označi profil kao verifikovan i očisti kod
    korisnik.isVerifikovan = true;
    korisnik.verifikacijskiKod = null;
    korisnik.kodIstice = null;
    await korisnik.save();

    res.status(200).json({ poruka: 'E-mail uspješno verifikovan! Možete se prijaviti.' });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri verifikaciji koda.', greska: error.message });
  }
};

// 3. LOGIN KORISNIKA
export const login = async (req, res) => {
  try {
    const { email, lozinka } = req.body;

    // Pronađi korisnika po emailu
    const korisnik = await User.findOne({ email });
    if (!korisnik) {
      return res.status(400).json({ poruka: 'Pogrešan email ili lozinka.' });
    }

    // 1. Prvo provjeri lozinku
    const isLozinkaTacna = await bcrypt.compare(lozinka, korisnik.lozinka);
    if (!isLozinkaTacna) {
      return res.status(400).json({ poruka: 'Pogrešan email ili lozinka.' });
    }

    // 2. Provjeri da li je korisnik banovan
    if (korisnik.isBanovan) {
      return res.status(403).json({ poruka: 'Vaš nalog je suspendovan zbog kršenja pravila licitacije.' });
    }

    // 3. Provjeri da li je profil verifikovan
    if (!korisnik.isVerifikovan) {
      return res.status(403).json({ 
        poruka: 'Vaš profil nije verifikovan. Unesite kod sa vašeg e-maila.',
        neverifikovan: true,
        email: korisnik.email 
      });
    }

    // Generisanje JWT Tokena koji važi 30 dana
    const token = jwt.sign(
      { id: korisnik._id, ime: korisnik.ime, isAdmin: korisnik.isAdmin },
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
        isAdmin: korisnik.isAdmin || false,
        kazneniPoeni: korisnik.kazneniPoeni
      }
    });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška na serveru', greska: error.message });
  }
};

// 4. PONOVNO SLANJE KODA
export const posaljiPonovoKod = async (req, res) => {
  try {
    const { email } = req.body;

    const korisnik = await User.findOne({ email });
    if (!korisnik) {
      return res.status(404).json({ poruka: 'Korisnik sa ovim e-mailom nije pronađen.' });
    }

    if (korisnik.isVerifikovan) {
      return res.status(400).json({ poruka: 'Vaš račun je već verifikovan.' });
    }

    // Generiši novi kod i produži trajanje na 15 min
    const novikod = Math.floor(100000 + Math.random() * 900000).toString();
    korisnik.verifikacijskiKod = novikod;
    korisnik.kodIstice = new Date(Date.now() + 15 * 60 * 1000);
    await korisnik.save();

    // Pošalji e-mail
    await posaljiVerifikacijskiEmail(korisnik.email, korisnik.ime, novikod);

    res.status(200).json({ poruka: 'Novi verifikacijski kod je uspješno poslan na e-mail!' });
  } catch (error) {
    console.error('Greška pri ponovnom slanju koda:', error);
    res.status(500).json({ poruka: 'Greška pri slanju e-maila. Provjerite server logove.', greska: error.message });
  }
};