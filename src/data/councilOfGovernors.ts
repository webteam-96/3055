import type { DistrictCommitteeMember } from '../types/api'

// Council of Governors — the past District Governors listed in RID 3055's
// "College of Governors" section, transcribed from the printed District 3055
// Directory 2025-26 (pages 44-49). Photos are the COLOUR portraits extracted from
// those same cards (the left photo of each pair — the governor; the right is the
// spouse). Each DG's term rides in `DistrictDesignation` = "District Governor
// YYYY-YY", so the existing CommitteeMemberRow card (the Executive Committee card)
// renders it unchanged.
//
// Field mapping (2025-26 label -> card field):
//   Mobile -> Contact (MobileNumber)   Vocation -> Classification
//   Birth Date -> DOB                    Home Club -> Home Club (ClubName)
//   E-mail -> E-mail (MailID)            Spouse Name -> Spouse (SpouseName)
//   Spouse Birth Date -> Spouse DOB      Wedding Anniversary -> DOA
// Some governors served predecessor/other RI districts (3050/3051/3054/3060/3250)
// and are now RID 3055 members; the directory lists them by their DG term year.

import imgRavinDaftri from '../assets/images/cog/ravin-daftri.jpg'
import imgAnilKumarGupta from '../assets/images/cog/anil-kumar-gupta.png'
import imgSharadbhaiShah from '../assets/images/cog/sharadbhai-shah.png'
import imgShashankRathod from '../assets/images/cog/shashank-rathod.jpg'
import imgBharatMDholakia from '../assets/images/cog/bharat-m-dholakia.png'
import imgJoitabhaiPatel from '../assets/images/cog/joitabhai-patel.png'
import imgArunParikh from '../assets/images/cog/arun-parikh.png'
import imgHarshadUdeshi from '../assets/images/cog/harshad-udeshi.jpg'
import imgJayprakashVyas from '../assets/images/cog/jayprakash-vyas.png'
import imgAshishDesai from '../assets/images/cog/ashish-desai.png'
import imgGyaneshwarRao from '../assets/images/cog/gyaneshwar-rao.png'
import imgJagdishPatel from '../assets/images/cog/jagdish-patel.png'
import imgLalitSharma from '../assets/images/cog/lalit-sharma.png'
import imgMaullinPatel from '../assets/images/cog/maullin-patel.png'
import imgBinaDesai from '../assets/images/cog/bina-desai.png'
import imgAshokMangal from '../assets/images/cog/ashok-mangal.png'
import imgMehulRathod from '../assets/images/cog/mehul-rathod.jpg'
import imgMohanParashar from '../assets/images/cog/mohan-parashar.jpg'
import imgNigamkumarChaudhari from '../assets/images/cog/nigamkumar-chaudhari.jpg'
import imgNaimishRavani from '../assets/images/cog/naimish-ravani.jpg'
import imgShyamKumar from '../assets/images/cog/shyam-kumar.jpg'

// Fields the College-of-Governors cards don't carry.
const BLANKS = {
  BloodGroup: '',
  Bloodgrp: '',
  Address: '',
  RotaryID: '',
  SpousePhoto: '',
  Spouse_DOB: '',
  Spouse_Mobile_Number: '',
  SpouseMobileNumber: '',
  SpouseMobile: '',
  Keywords: '',
} as const

// A DG entry, optionally linked to their LIVE API member profile id so the card's
// photo can be sourced from the API — the same photo the member has on every other
// card. See cogWithApiPhotos().
export type CogMember = DistrictCommitteeMember & { memberId?: number }

function dg(
  term: string,
  photo: string,
  name: string,
  club: string,
  dob: string,
  vocation: string,
  email: string,
  mobile: string,
  spouse: string,
  spouseDob: string,
  doa: string,
  memberId?: number,
): CogMember {
  return {
    ...BLANKS,
    DistrictDesignation: `District Governor ${term}`,
    img: photo,
    name,
    ClubName: club,
    DOB: dob,
    classification: vocation,
    MailID: email,
    MobileNumber: mobile,
    SpouseName: spouse,
    SpouseDOB: spouseDob,
    DOA: doa,
    ...(memberId != null ? { memberId } : {}),
  }
}

// In chronological order of term, as printed. The trailing number is the member's
// LIVE API profile id — used to source their photo from the API so it matches their
// other cards (see cogWithApiPhotos). Two DGs intentionally have NO id: 1998-99
// (Sharad P. Shah — the API holds no photo for him) and 2017-18 (Maullin Patel — the
// phone on file is his wife Sonal's, so the API record is hers); both keep their
// curated printed-book portrait.
export const COUNCIL_OF_GOVERNORS: CogMember[] = [
  dg('1983-84', imgRavinDaftri, 'Ravin Daftri', 'Ahmedabad Metro', '12-12', 'Printing', 'jrdaftari@hotmail.com', '99240 97909', 'Jyoti', '06-05', '04-12', 348656),
  dg('1993-94', imgAnilKumarGupta, 'Anil Kumar Gupta', 'Ahmedabad Metro', '29-11', 'Education : Abroad', 'akg.bsbk@gmail.com', '94311 28188', 'Meena', '28-08', '21-06', 347817),
  dg('1998-99', imgSharadbhaiShah, 'Sharadbhai Shah', 'Mehsana', '29-07', 'Law : General Practice', 'sharadpshah@yahoo.com', '94297 36365', 'Ila', '01-08', '01-05'),
  dg('2000-01', imgShashankRathod, 'Shashank Rathod Dr.', 'Ahmedabad Metro', '03-11', 'Medicine : Ophthalmology', 'shashankeyecare@gmail.com', '98240 23126', 'Bina', '23-01', '17-01', 348664),
  dg('2001-02', imgBharatMDholakia, 'Bharat M. Dholakia', 'Bhuj', '03-01', 'Law : Commercial', 'bmdholakia@gmail.com', '98252 25054', 'Meena', '20-07', '02-06', 885611),
  dg('2004-05', imgJoitabhaiPatel, 'Joitabhai Patel', 'Ahmedabad Mid Town', '13-05', 'Govt. Administration (Retd.)', 'joitabhai@yahoo.com', '94260 15285', 'Sharada', '08-11', '01-05', 348667),
  dg('2005-06', imgArunParikh, 'Arun Parikh Dr.', 'Himatnagar', '26-05', 'Family Physician', 'drarunp@yahoo.com', '94264 18688', 'Bina', '06-06', '07-05', 348668),
  dg('2007-08', imgHarshadUdeshi, 'Harshad L. Udeshi Dr.', 'Mandvi-Kutch', '13-10', 'Medicine : General Practice', 'udeshihl@gmail.com', '98252 36390', 'Bhavna', '01-01', '19-11', 924457),
  dg('2009-10', imgJayprakashVyas, 'Jayprakash Vyas Dr.', 'Sabarmati (Ahmedabad)', '06-05', 'Medicine : Paediatrics', 'drjvyas@gmail.com', '98240 12876', 'Neeta', '27-12', '19-11', 348672),
  dg('2012-13', imgAshishDesai, 'Ashish Desai', 'Kankaria (Ahmedabad)', '25-05', 'Education : University Administration', '3050ashish@gmail.com', '98253 20090', 'Bina', '12-03', '05-12', 348674),
  dg('2013-14', imgGyaneshwarRao, 'Gyaneshwar Rao Dr.', 'Bhuj Flamingo', '23-04', 'Medicine : Surgery', 'dgrao1314@gmail.com', '98252 25405', 'Alka Dr.', '03-06', '16-01', 348676),
  dg('2014-15', imgJagdishPatel, 'Jagdish Patel', 'Visnagar', '06-06', 'M.S. & Alloy Steels Bright Bars Mfg.', 'jagdish3051@yahoo.com', '98250 61321', 'Indira', '01-02', '23-05', 348677),
  dg('2015-16', imgLalitSharma, 'Lalit Sharma CA', 'Ahmedabad River Front', '24-03', 'Auditing & Project Consultancy', 'lalitsharma2001@hotmail.com', '98251 12060', 'Usha', '28-07', '22-01', 348679),
  dg('2017-18', imgMaullinPatel, 'Maullin Patel', 'Mehsana', '07-12', 'Stock Investment', 'maulline63@yahoo.com', '98240 39739', 'Sonal', '28-07', '12-12'),
  dg('2019-20', imgBinaDesai, 'Bina Desai', 'Kankaria (Ahmedabad)', '12-03', 'Social Service', '3054bina@gmail.com', '98980 20090', 'Ashish', '25-05', '05-12', 348685),
  dg('2021-22', imgAshokMangal, 'Ashok Mangal', 'Palanpur', '15-09', 'Engineering : Electrical', 'mangalashok0691@gmail.com', '94294 22422', 'Pushpa', '28-10', '01-06', 348687),
  dg('2023-24', imgMehulRathod, 'Mehul Rathod', 'Ahmedabad Metro', '21-05', 'Law : Civil', 'mehulrathod.rotary@gmail.com', '98253 26368', 'Bhavna', '14-01', '20-01', 604916),
  dg('2024-25', imgMohanParashar, 'Mohan Parashar', 'Jalore', '05-03', 'CA : Auditing', 'dg2425rid3055@gmail.com', '98285 23296', 'Anita', '05-03', '13-07', 847269),
  dg('2025-26', imgNigamkumarChaudhari, 'Nigamkumar Chaudhari', 'Visnagar', '28-04', 'Architecture', 'dg2526rid3055@gmail.com', '98250 68022', 'Pragna', '15-01', '15-02', 847270),
  dg('2026-27', imgNaimishRavani, 'Naimish Ravani', 'Ahmedabad Supreme', '19-11', 'Land Aggregation', 'naimish_ravani@yahoo.com', '70690 16660', 'Hemal', '02-05', '29-01', 952818),
  // Name given-name-first ("Shyam Kumar K. A.") so the photo caption reads "Shyam"
  // (the card derives the caption from the first name token) rather than "K".
  dg('2027-28', imgShyamKumar, 'Shyam Kumar K. A.', 'Abu Road', '03-04', 'Education Administration', 'kask63@yahoo.in', '96493 11113', 'Uma', '05-05', '27-02', 1112743),
]

/**
 * The Council of Governors with each DG's photo swapped for their LIVE API profile
 * photo (looked up by `memberId`), so a DG never shows a different photo here than on
 * their club / committee cards. DGs with no `memberId` keep their curated portrait.
 * `photos` comes from `selectMemberPhotos`; while it is absent (still loading) the
 * curated portraits are used as a graceful fallback.
 */
export function cogWithApiPhotos(photos?: Map<number, string>): CogMember[] {
  if (!photos || photos.size === 0) return COUNCIL_OF_GOVERNORS
  return COUNCIL_OF_GOVERNORS.map((m) => {
    const url = m.memberId != null ? photos.get(m.memberId) : undefined
    return url ? { ...m, img: url } : m
  })
}
