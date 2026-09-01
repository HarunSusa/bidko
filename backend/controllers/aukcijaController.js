import Auction from '../models/Auction.js';

// Pomoćna funkcija za eskapiranje regex znakova u pretrazi
const escapeRegex = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

// 1. KREIRANJE NOVE AUKCIJE / FIKSNOG OGLASA
export const kreirajAukciju = async (req, res) => {
  try {
    const { 
      naslov, 
      opis, 
      pocetnaCijena, 
      fiksnaCijena, 
      tipProdaje, 
      slike, 
      slika, 
      kategorija, 
      lokacija, 
      trajanjeDo,
      dostava,
      naciniPlacanja
    } = req.body;

    const finalSlike = slike && slike.length > 0 ? slike : (slika ? [slika] : []);
    const definisaniTip = tipProdaje || 'aukcija';
    const inicijalnaCijena = Number(pocetnaCijena) || 0;

    const novaAukcija = new Auction({
      naslov,
      opis,
      tipProdaje: definisaniTip,
      pocetnaCijena: inicijalnaCijena,
      trenutnaCijena: inicijalnaCijena,
      fiksnaCijena: definisaniTip !== 'aukcija' ? (Number(fiksnaCijena) || null) : null,
      slike: finalSlike,
      kategorija,
      lokacija: lokacija || '',
      trajanjeDo: definisaniTip === 'fiksno' ? null : trajanjeDo,
      prodavac: req.korisnik._id,
      dostava,
      naciniPlacanja
    });

    const spasenaAukcija = await novaAukcija.save();
    res.status(201).json({ poruka: 'Oglas uspješno kreiran!', aukcija: spasenaAukcija });
  } catch (error) {
    console.error("Greška pri kreiranju aukcije:", error);
    res.status(500).json({ poruka: 'Greška pri kreiranju aukcije', greska: error.message });
  }
};

// 2. PREUZIMANJE SVIH AUKCIJA (SA PRETRAGOM I FILTRIRANJEM)
export const preuzmiAukcije = async (req, res) => {
  try {
    const { pretraga, kategorija } = req.query;
    let query = { status: 'aktivno' };

    if (pretraga) {
      const cleanSearch = escapeRegex(pretraga);
      query.$or = [
        { naslov: { $regex: cleanSearch, $options: 'i' } },
        { opis: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    if (kategorija) {
      query.kategorija = kategorija;
    }

    const aukcije = await Auction.find(query)
      .populate('prodavac', 'ime email')
      .sort({ createdAt: -1 });

    res.status(200).json(aukcije);
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri preuzimanju aukcija', greska: error.message });
  }
};

// 3. DODAVANJE PONUDE NA AUKCIJE (LICITIRANJE - Atomski upit sprečava Race Conditions)
export const dodajPonudu = async (req, res) => {
  try {
    const { aukcijaId } = req.params;
    const { iznos } = req.body;
    const korisnikId = req.korisnik._id;
    const numerickiIznos = Number(iznos);

    if (!numerickiIznos || numerickiIznos <= 0) {
      return res.status(400).json({ poruka: 'Molimo unesite ispravan iznos ponude.' });
    }

    const aukcija = await Auction.findById(aukcijaId);

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    if (aukcija.status !== 'aktivno') {
      return res.status(400).json({ poruka: 'Aukcija više nije aktivna.' });
    }

    if (aukcija.trajanjeDo && new Date(aukcija.trajanjeDo) < new Date()) {
      return res.status(400).json({ poruka: 'Aukcija je već završena!' });
    }

    if (aukcija.prodavac.toString() === korisnikId.toString()) {
      return res.status(400).json({ poruka: 'Ne možete licitirati na sopstvenu aukciju.' });
    }

    // Atomsko ažuriranje: Čuva bazu ako je neko u međuvremenu ponudio više
    const osvezenaAukcija = await Auction.findOneAndUpdate(
      {
        _id: aukcijaId,
        status: 'aktivno',
        trenutnaCijena: { $lt: numerickiIznos }
      },
      {
        $set: { trenutnaCijena: numerickiIznos },
        $push: {
          ponude: {
            korisnik: korisnikId,
            iznos: numerickiIznos,
            vrijemePonude: new Date(),
            status: 'aktivno'
          }
        }
      },
      { new: true }
    );

    if (!osvezenaAukcija) {
      return res.status(400).json({ 
        poruka: `Vaša ponuda mora biti veća od trenutne cijene (${aukcija.trenutnaCijena} KM) ili je aukcija završena.` 
      });
    }

    res.status(200).json({ 
      poruka: 'Ponuda uspješno prihvaćena!', 
      trenutnaCijena: osvezenaAukcija.trenutnaCijena 
    });

  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri slanju ponude', greska: error.message });
  }
};

// 4. PONIŠTAVANJE PONUDE OD STRANE KUPCA
export const ponistiPonudu = async (req, res) => {
  try {
    const { aukcijaId, ponudaId } = req.params;
    const { razlog } = req.body; 
    const korisnikId = req.korisnik._id;

    const aukcija = await Auction.findById(aukcijaId);
    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    const ponuda = aukcija.ponude.id(ponudaId);
    if (!ponuda) {
      return res.status(404).json({ poruka: 'Ponuda nije pronađena.' });
    }

    if (ponuda.korisnik.toString() !== korisnikId.toString()) {
      return res.status(403).json({ poruka: 'Možete poništiti samo vlastitu ponudu.' });
    }

    if (ponuda.status === 'ponisteno') {
      return res.status(400).json({ poruka: 'Ova ponuda je već poništena.' });
    }

    const sada = new Date();

    // Zabrana u zadnjih 12 sati aukcije
    if (aukcija.trajanjeDo) {
      const preostaloDoKraja = (new Date(aukcija.trajanjeDo) - sada) / (1000 * 60 * 60);
      if (preostaloDoKraja < 12) {
        return res.status(400).json({ poruka: 'Nije moguće poništiti ponudu u zadnjih 12 sati aukcije.' });
      }
    }

    const trajanjeOdPonude = (sada - new Date(ponuda.vrijemePonude)) / (1000 * 60);
    const datumIzmjeneAukcije = new Date(aukcija.updatedAt);
    const datumPonude = new Date(ponuda.vrijemePonude);

    const jeUnutar15Minuta = trajanjeOdPonude <= 15;
    const artikalIzmijenjenNakonPonude = datumIzmjeneAukcije > datumPonude;

    if (!jeUnutar15Minuta && !artikalIzmijenjenNakonPonude) {
      return res.status(400).json({ 
        poruka: 'Prošlo je više od 15 minuta od postavljanja ponude, a oglas nije izmijenjen nakon vaše ponude.' 
      });
    }

    // Određivanje razloga u skladu sa enumom u šemi
    let finalniRazlog = razlog;
    if (!finalniRazlog) {
      finalniRazlog = artikalIzmijenjenNakonPonude 
        ? 'Prodavač izmijenio opis ili stanje artikla' 
        : 'Tipfeler greška';
    }

    ponuda.status = 'ponisteno';
    ponuda.razlogPonistavanja = finalniRazlog;
    ponuda.vrijemePonistavanja = sada;

    // Preračunavanje trenutne cijene prema preostalim aktivnim ponudama
    const aktivnePonude = aukcija.ponude.filter(p => p.status === 'aktivno');
    if (aktivnePonude.length > 0) {
      const najvisaPonuda = Math.max(...aktivnePonude.map(p => p.iznos));
      aukcija.trenutnaCijena = najvisaPonuda;
    } else {
      aukcija.trenutnaCijena = aukcija.pocetnaCijena;
    }

    await aukcija.save();

    res.status(200).json({
      poruka: 'Ponuda je uspješno poništena.',
      novaTrenutnaCijena: aukcija.trenutnaCijena
    });

  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri poništavanju ponude.', greska: error.message });
  }
};

// 5. PREUZIMANJE DETALJA JEDNE SPECIFIČNE AUKCIJE
export const preuzmiAukcijuPoId = async (req, res) => {
  try {
    const { aukcijaId } = req.params;

    const aukcija = await Auction.findById(aukcijaId)
      .populate('prodavac', 'ime email')
      .populate('ponude.korisnik', 'ime email')
      .populate('diskusija.korisnik', 'ime email');

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    res.status(200).json(aukcija);
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri preuzimanju detalja aukcije', greska: error.message });
  }
};

// 6. BRISANJE / OTKAZIVANJE AUKCIJE
export const obrisiAukciju = async (req, res) => {
  try {
    const { aukcijaId } = req.params;
    const korisnikId = req.korisnik._id;

    const aukcija = await Auction.findById(aukcijaId);

    if (!aukcija) {
      return res.status(404).json({ poruka: 'Aukcija nije pronađena.' });
    }

    if (aukcija.prodavac.toString() !== korisnikId.toString()) {
      return res.status(403).json({ poruka: 'Nemate ovlaštenje da obrišete ovu aukciju.' });
    }

    // Opcionalno: Sprečavanje brisanja ako aukcija već ima aktivne ponude
    const imaAktivnihPonuda = aukcija.ponude.some(p => p.status === 'aktivno');
    if (imaAktivnihPonuda) {
      return res.status(400).json({ poruka: 'Ne možete obrisati aukciju na kojoj već postoje aktivne ponude.' });
    }

    await Auction.findByIdAndDelete(aukcijaId);

    res.status(200).json({ poruka: 'Aukcija je uspješno otkazana i obrisana!' });
  } catch (error) {
    res.status(500).json({ poruka: 'Greška pri brisanju aukcije', greska: error.message });
  }
};