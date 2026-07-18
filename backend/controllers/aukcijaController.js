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

// 3. DODAVANJE PONUDE NA AUKCIJU (LICITIRANJE)
export const dodajPonudu = async (req, res) => {
  try {
    const { aukcijaId } = req.params;
    const { iznos } = req.body; // Iznos koji korisnik nudi
    const korisnikId = req.korisnik._id;

    // 1. Pronađi aukciju u bazi
    const aukcija = await Auction.findById(aukcijaId);

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    // 2. Provjera da li je aukcija istekla
    if (new Date(aukcija.trajanjeDo) < new Date()) {
      return res.status(400).json({ poruka: 'Aukcija je već završena!' });
    }

    // 3. Vlasnik ne može licitirati na svoj artikal
    if (aukcija.prodavac.toString() === korisnikId.toString()) {
      return res.status(400).json({ poruka: 'Ne možete licitirati na sopstvenu aukciju.' });
    }

    // 4. Nova ponuda mora biti veća od trenutne cijene
    if (iznos <= aukcija.trenutnaCijena) {
      return res.status(400).json({ 
        poruka: `Ponuda mora biti veća od trenutne cijene koja iznosi ${aukcija.trenutnaCijena} KM.` 
      });
    }

    // 5. Ako je sve OK, ažuriramo trenutnu cijenu i dodajemo ponudu u niz
    aukcija.trenutnaCijena = iznos;
    
    // Provjeri da li tvoj model koristi 'ponude' ili 'bids' i prilagodi po potrebi:
    aukcija.ponude.push({
      korisnik: korisnikId,
      iznos: iznos,
      vrijeme: new Date()
    });

    await aukcija.save();

    res.status(200).json({ 
      poruka: 'Ponuda uspješno prihvaćena!', 
      trenutnaCijena: aukcija.trenutnaCijena 
    });

  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri slanju ponude', greska: error.message });
  }
};
// 4. PREUZIMANJE DETALJA JEDNE SPECIFIČNE AUKCIJE
export const preuzmiAukcijuPoId = async (req, res) => {
  try {
    const { aukcijaId } = req.params;

    // Pronađi aukciju i popuni podatke o prodavcu, ali i o korisnicima unutar niza ponuda
    const aukcija = await Auction.findById(aukcijaId)
      .populate('prodavac', 'ime email')
      .populate('ponude.korisnik', 'ime email');

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    res.status(200).json(aukcija);
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri preuzimanju detalja aukcije', greska: error.message });
  }
};

// 5. BRISANJE / OTKAZIVANJE AUKCIJE
export const obrisiAukciju = async (req, res) => {
  try {
    const { aukcijaId } = req.params;
    const korisnikId = req.korisnik._id;

    const aukcija = await Auction.findById(aukcijaId);

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    // Provjera: Samo prodavac (vlasnik) može obrisati svoju aukciju
    if (aukcija.prodavac.toString() !== korisnikId.toString()) {
      return res.status(403).json({ poruka: 'Nemate ovlaštenje da obrišete ovu aukciju.' });
    }

    // Opcionalno: Možeš dodati pravilo da se aukcija ne može obrisati ako već ima ponuda, 
    // ali za sada ćemo dozvoliti brisanje
    await Auction.findByIdAndDelete(aukcijaId);

    res.status(200).json({ poruka: 'Aukcija je uspješno otkazana i obrisana!' });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri brisanju aukcije', greska: error.message });
  }
};