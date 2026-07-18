import Auction from '../models/Auction.js'; // Prilagodi tačan naziv modela ako se zove drugačije

// 1. KREIRANJE NOVE AUKCIJE
export const kreirajAukciju = async (req, res) => {
  try {
    // Dodali smo kategorija i trajanjeDo u destrukturiranje
    const { naslov, opis, pocetnaCijena, slika, kategorija, trajanjeDo } = req.body;

    const novaAukcija = new Auction({
      naslov,
      opis,
      pocetnaCijena,
      trenutnaCijena: pocetnaCijena,
      slika,
      kategorija,       // NOVO
      trajanjeDo,       // NOVO (usklađeno sa modelom)
      prodavac: req.korisnik._id
    });

    const spasenaAukcija = await novaAukcija.save();
    res.status(201).json({ poruka: 'Aukcija uspješno kreirana!', aukcija: spasenaAukcija });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri kreiranju aukcije', greska: error.message });
  }
};

// 2. PREUZIMANJE SVIH AKTIVNIH AUKCIJA
export const preuzmiAukcije = async (req, res) => {
  try {
    const aukcije = await Auction.find().populate('prodavac', 'ime email');
    res.status(200).json(aukcije);
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri preuzimanju aukcija', greska: error.message });
  }
};