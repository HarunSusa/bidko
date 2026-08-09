import cron from 'node-cron';
import Auction from '../models/Auction.js';
import posaljiEmaiObavjestenja from '../utils/emailService.js';

const pokreniCronZadatke = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const sada = new Date();

      const istekleAukcije = await Auction.find({
        trajanjeDo: { $lte: sada },
        obavjestenjePoslano: false
      })
      .populate('prodavac')
      .populate('ponude.korisnik');

      for (const aukcija of istekleAukcije) {
        aukcija.status = 'zavrseno';
        aukcija.obavjestenjePoslano = true;

        let pobjednik = null;
        if (aukcija.ponude && aukcija.ponude.length > 0) {
          const zadnjaPonuda = aukcija.ponude[aukcija.ponude.length - 1];
          pobjednik = zadnjaPonuda.korisnik;
          aukcija.pobjednik = pobjednik?._id || pobjednik;
        }

        await aukcija.save();

        if (aukcija.prodavac) {
          await posaljiEmaiObavjestenja(aukcija, aukcija.prodavac, pobjednik);
        }
      }
    } catch (error) {
      console.error('Greška unutar Cron Zadaće:', error);
    }
  });
};

// OBAVEZNO OVO NA DNU (ES Module Export):
export default pokreniCronZadatke;