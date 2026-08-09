import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Osigurava učitavanje EMAIL_USER i EMAIL_PASS iz .env fajla
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Dinamičko podešavanje sa kojeg emaila se šalje
const FROM_EMAIL = `"Bidko Platforma" <${process.env.EMAIL_USER}>`;

// 1. POSEBNA FUNKCIJA ZA VERIFIKACIJU RAČUNA (SLANJE KODA)
export const posaljiVerifikacijskiEmail = async (email, ime, kod) => {
  try {
    await transporter.sendMail({
      from: FROM_EMAIL,
      to: email,
      subject: '🔒 Verifikacijski kod za vaš Bidko račun',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9fafb; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #111827;">Pozdrav ${ime},</h2>
          <p style="color: #4b5563;">Hvala vam na registraciji na Bidko platformi.</p>
          <p style="color: #4b5563;">Vaš verifikacijski kod za aktivaciju naloga je:</p>
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; font-size: 26px; font-weight: bold; color: #2563eb; letter-spacing: 6px; padding: 14px; text-align: center; border-radius: 8px; margin: 20px 0;">
            ${kod}
          </div>
          <p style="color: #6b7280; font-size: 12px;">Kod važi narednih 15 minuta.</p>
        </div>
      `
    });
    console.log(`✅ Verifikacijski e-mail uspješno poslan na: ${email}`);
  } catch (error) {
    console.error('❌ Greška pri slanju verifikacijskog e-maila:', error);
    throw error;
  }
};

// 2. FUNKCIJA ZA ZAVRŠETAK AUKCIJE
const posaljiEmaiObavjestenja = async (aukcija, prodavac, pobjednik) => {
  try {
    if (pobjednik) {
      // Mail Pobjedniku
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: pobjednik.email,
        subject: `🎉 Čestitamo! Pobijedili ste na aukciji: ${aukcija.naslov}`,
        html: `
          <h2>Čestitamo ${pobjednik.ime || ''}!</h2>
          <p>Vaša ponuda od <b>${aukcija.trenutnaCijena} KM</b> je bila najviša za artikal <b>${aukcija.naslov}</b>.</p>
          <hr />
          <h3>Kontakt podaci prodavača:</h3>
          <p><b>Ime:</b> ${prodavac.ime}</p>
          <p><b>Email:</b> ${prodavac.email}</p>
          <p><b>Telefon:</b> ${prodavac.telefon || 'Nije naveden'}</p>
          <br />
          <p>Molimo vas da kontaktirate prodavača radi dogovora o preuzimanju i plaćanju.</p>
        `
      });

      // Mail Prodavaču
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: prodavac.email,
        subject: `🔨 Vaša aukcija je završena: ${aukcija.naslov}`,
        html: `
          <h2>Pozdrav ${prodavac.ime},</h2>
          <p>Vaša aukcija za artikal <b>${aukcija.naslov}</b> je uspješno završena po cijeni od <b>${aukcija.trenutnaCijena} KM</b>.</p>
          <hr />
          <h3>Kontakt podaci pobjednika:</h3>
          <p><b>Ime:</b> ${pobjednik.ime}</p>
          <p><b>Email:</b> ${pobjednik.email}</p>
          <p><b>Telefon:</b> ${pobjednik.telefon || 'Nije naveden'}</p>
          <br />
          <p>Možete kontaktirati kupca radi realizacije prodaje.</p>
        `
      });
    } else if (prodavac) {
      // Mail Prodavaču ako nije bilo ponuda
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: prodavac.email,
        subject: `Info o aukciji: ${aukcija.naslov}`,
        html: `
          <h2>Pozdrav ${prodavac.ime},</h2>
          <p>Vaša aukcija za <b>${aukcija.naslov}</b> je završena, ali nažalost nije bilo pristiglih ponuda.</p>
        `
      });
    }
    console.log(`✅ E-mailovi obavještenja uspješno poslani za aukciju: ${aukcija._id}`);
  } catch (error) {
    console.error('❌ Greška pri slanju e-maila obavještenja:', error);
  }
};

export default posaljiEmaiObavjestenja;