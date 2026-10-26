// People shown on the "Profile & Message" page. This is the single source of
// truth — the user supplies this data (from "Messages and Profile.docx").
//
// The /message page lists one card per person (by name). Clicking a card opens
// that person's detail page (/message-details), which renders their Profile
// and/or Message using the LeaderPage design (the Finalised Page layout on the
// Border.svg background).
//
// Tips:
//   - A person can have a `profile`, a `message`, or both (omit either). When
//     both are present, the detail page renders the Profile page then the
//     Message page (two stacked B5 sheets).
//   - `designation` is the title only (e.g. "District Governor"); put the term
//     in `year` (e.g. "2026-27") so it renders on its own line in navy.
//   - Use \n\n inside content for paragraph breaks; a single \n inside a
//     paragraph renders as a line break (used for bullet lists).
//   - Leave `photo` as '' to show the placeholder image until a real portrait
//     is given. Import a bundled image (see below) or pass a URL string.
import babalola from '../assets/images/leader/leader-babalola-couple.jpg'
import babalolaMessage from '../assets/images/leader/leader-sample-babalola.jpg'
import shyamKumar from '../assets/images/leader/leader-shyam-kumar.jpg'
import shyamKumarCouple from '../assets/images/leader/leader-shyam-kumar-couple.jpg'
import aneriBhatt from '../assets/images/leader/leader-aneri-bhatt.jpg'
import geetikaSaluja from '../assets/images/leader/leader-geetika-saluja.jpg'
import varshaShah from '../assets/images/leader/leader-varsha-shah.jpg'
import nagesh from '../assets/images/leader/leader-nagesh-couple.jpg'
import mmmCouple from '../assets/images/leader/leader-mmm-couple.jpg'
import mmmPortrait from '../assets/images/leader/leader-mmm-portrait.jpg'
import vikramCouple from '../assets/images/leader/leader-vikram-couple.jpg'
import vikram from '../assets/images/leader/leader-vikram.jpg'
import naimishCouple from '../assets/images/leader/leader-naimish-couple.jpg'
import nageshMessage from '../assets/images/leader/leader-nagesh.jpg'
import naimishMessage from '../assets/images/leader/leader-naimish.jpg'
import venkyCouple from '../assets/images/leader/leader-venky-couple.jpg'
import venky from '../assets/images/leader/leader-venky.jpg'
import jpVyas from '../assets/images/leader/leader-jp-vyas.jpg'

export interface Person {
  name: string
  designation: string
  /** Rotary year/term, e.g. "2026-27". Optional. */
  year?: string
  photo: string
  /** Optional separate portrait for the Message sheet; falls back to `photo`. */
  messagePhoto?: string
  profile?: string
  message?: string
  /** Optional cap on how many B5 sheets the profile / message may span. When set,
   *  LeaderPage shrinks the body to fit within that many pages instead of
   *  paginating at full size. Omit to use the default behaviour. */
  profileMaxPages?: number
  messageMaxPages?: number
  /** Optional CSS top offset for the content block (default 15%); shifts the
   *  identity+body up/down. Omit to keep the default position. */
  contentTop?: string
  /** Optional body-copy size nudge in px (negative = smaller) applied on top of
   *  the auto-fitted size, per document. Omit for the auto-fitted size. */
  profileBodyFontDeltaPx?: number
  messageBodyFontDeltaPx?: number
  /** Fixed profile-body font size in cqw (bypasses the auto-fit); pair with
   *  profileBodyLineHeight so the copy still fits one page. */
  profileBodyFontCqw?: number
  /** Profile-body line-height override (default 1.62). */
  profileBodyLineHeight?: number
  /** Optional photo-frame variant class for the Profile sheet (size/crop tweak). */
  profilePhotoVariant?: string
}

export const PEOPLE: Person[] = [
  {
    name: 'Olayinka Hakeem Babalola',
    designation: 'Rotary International President\n2026-27',
    photo: babalola,
    messagePhoto: babalolaMessage, // Message keeps the original portrait
    // Expanded 7-paragraph profile on a SINGLE sheet at a FIXED body size. Sized to
    // match Muruganandam's auto-fitted profile body (1.6458cqw); the slightly smaller
    // type frees vertical room for comfortable leading (1.38 vs the old cramped 1.14)
    // so all the copy still sits above the bottom curve while reading far better.
    profileBodyFontCqw: 1.6458,
    profileBodyLineHeight: 1.38,
    // Lift the whole content block up 2% (from the default 10%) so the last body line
    // clears the bottom curve ornament instead of grazing it.
    contentTop: '8%',
    profilePhotoVariant: 'lp-photo--uniform', // shared uniform frame (46% × 170/220)
    profile: `Olayinka Hakeem Babalola, a member of the Rotary Club of Trans Amadi, Nigeria, has been selected by the Board of Directors to become Rotary International's president for 2026-27. His term will begin on 1 July 2026.

The Board, guided by the RI code of policies, conducted a special session to select the organization's leader after the resignation of RI President-elect SangKoo Yun, who decided to step back from his Rotary responsibilities and focus on his recovery from recent cancer treatment.

Babalola began his Rotary journey in 1984 as a Rotaractor. He joined the Rotary Club of Trans Amadi 10 years later. His leadership roles include serving as district governor (2011-12), RI vice president (2019-20), and member of the RI Board (2018-20). He was also an active leader and participant in RI committees such as the End Polio Now Countdown to History Campaign Committee (2017-23) and the Nigeria National PolioPlus Committee (2013-present, adviser 2016-present).

Babalola received a university degree in engineering in 1988. He worked for 25 years in the oil and gas industry, holding senior positions in Shell PLC. He is the founder of two companies: Riviera Technical Services Ltd., an oil and gas infrastructure delivery company, and Lead and Change Consulting, an executive coaching and organizational performance advisory group.

Babalola’s professional affiliations include the Nigerian Society of Engineers, the Institute of Safety Professionals of Nigeria, and the Association of Change Management Professionals. He is a member of Jericho Businessmen Club, an organization in his birth city of Ibadan that provides input to governments on economic and social policy.

Babalola and his wife, Preba, live in the city of Port Harcourt. He supports The Rotary Foundation with a named endowment and as an Arch Klumph Society member. A trustee of ShelterBox UK, he is a recipient of the Africa Centennial Heroes Award, the Regional Service Award for a Polio-Free World, the RI Service Above Self Award, and The Rotary Foundation Citation for Meritorious Service.

The president of Rotary International serves a one-year term, presiding over the Board of Directors and providing inspirational leadership for the organization. As the spokesperson for the global network, the president visits clubs around the world to promote Rotary’s values and represent the organization at major events. Rotary chooses its president from members who have demonstrated extensive leadership experience within Rotary, including service as a club president, district governor, and member of the Board.`,
    message: `Dear friends,

Rotary has changed my life, and I’m willing to bet that it has changed yours too. It expands our world, enriches our understanding of service, creates international friendships, and grounds us. It teaches us to see, to look beyond ourselves.

Think about our Vision Statement: Together, we see a world where people unite and take action to create lasting change—across the globe, in our communities, and in ourselves.

Those final words of our Vision Statement are at the heart of what it means to Create Lasting Impact. We often share how Rotary inspires lasting change in others, but we rarely discuss how it transforms us. We must consider how Rotary has changed our lives and share our stories widely. If we can do that, we will engage current members, expand our reach, and forge exciting connections with like-minded partners.

We must embrace Rotary’s global diversity and build a welcoming culture, one where fresh perspectives are embraced, new ideas are celebrated, and differences are met with curiosity and kindness instead of judgement. If we can do that, we will meet our membership goals and continue to grow.

And finally, we must reaffirm our commitment to service. We must think bigger, understanding our struggles as interconnected and leveraging our connections to make global progress. If we can do that, we will be one step closer to a world free of polio, a world where everyone has access to clean water and a quality education—a world at peace.

Let us continue to inspire one another and seek innovative solutions to some of the world’s most pressing challenges. I look forward to working alongside you in service.

Warm regards,
Olayinka H. Babalola
President, Rotary International 2026-27`,
  },
  {
    name: 'K. P. Nagesh',
    designation: 'Rotary International Director\n2025-27 (Zone 4 & 7)',
    photo: nagesh, // K. P. Nagesh & Uma Nagesh couple portrait
    // Shared uniform frame with the other profiles (`lp-photo--uniform`); his wide
    // landscape couple photo is cover-cropped to the box, trimming the side margins.
    profilePhotoVariant: 'lp-photo--uniform',
    // Body copy nudged +1px from the previous fitted size (a -2px shrink): the full
    // +2px reached the auto-fit default and ran into the bottom curve/watermark, so
    // -1 is the largest size that still lifts the last line clear of the art.
    profileBodyFontDeltaPx: -1,
    messagePhoto: nageshMessage, // Message: Nagesh solo headshot in the default frame
    // Long message — fit it onto one sheet at the largest readable size (the default
    // path's linear shrink under-fills it), matching the other single-page messages.
    messageMaxPages: 1,
    profile: `Flt. Lt. K.P. Nagesh is a self-made entrepreneur, educator, and social activist hailing from Ramanagara District in Karnataka, India. He graduated in mechanical engineering and joined the Indian Air Force as a Short Service Commission Officer in 1988. The Air Force instilled in him the values of commitment, dedication, discipline, and time management, which have contributed to his success as a leader.

Nagesh founded UNIQ Security Solutions as a result of his entrepreneurial spirit and leadership skills. Over 10,000 people were employed by this start-up, which later became the industry leader and had more than 500 clients in South India. He also established Uniq Skill Development Academy in Channapatna, Ramanagara District. This state-of-the-art, one-of-a-kind facility is devoted to providing vocational training to rural youth so they can find employment opportunities with the Indian Uniform services and Corporate Companies.

In the year 2015-16, Nagesh served as the District Governor of Rotary International District 3190, where he set unprecedented records in membership growth, the highest growth of women and youth members, and contributions to the Rotary Foundation. His leadership made him the number one performing District Governor in the world. District 3190 was also regarded as the number one district for the year. Rotary International recognized his talent and appointed him as the Asst Regional Rotary Foundation Coordinator (ARRFC) for 2016-17 and as the Endowment and Major Gifts Advisor for 2017-18.`,
    message: `Dear Fellow Rotarians,

There is a unique power in people who choose to serve with purpose. Create Lasting Impact is not just this year’s message—it is the heart of Rotary. Real impact is created when committed people come together, align around a shared intent, and stay long enough to make a difference that outlives any one project, any one year, or any one leader.

Rotary’s strength lies in its continuity of leadership. Each year, new leaders step forward—bringing fresh energy while carrying forward the values and direction of those before them. This steady rhythm of transition ensures that our work does not depend on individuals, but on a system of service that grows stronger with time. Governors, district leaders, and club teams together form a leadership chain that converts good intent into sustained impact.

This District Directory is more than a list of names and roles. It is a map of responsibility and trust. The leaders featured here are custodians of Rotary’s purpose. Their role is not to manage activity, but to enable impact—by setting clear direction, strengthening clubs, developing leaders, and ensuring that service reaches where it truly matters.

Congratulations to every district leader who has accepted the call to serve. Stepping into responsibility is a choice—and a commitment. By choosing to lead, you have chosen to carry forward Rotary’s values and to be accountable for the quality of impact created this year.

President Olayinka Hakeem Babalola’s call to Create Lasting Impact is a reminder that our work must go beyond events and numbers. Impact is created when clubs grow stronger, when membership expands with the right people, when leadership capacity deepens, and when communities feel the difference year after year. Growth is not optional—it is how impact multiplies.

As this new Rotary year begins, may every leader listed in this directory lead with clarity, humility, and courage. May every club use this network not just for coordination, but for collaboration. And may every Rotarian measure success not by activity alone, but by the depth and durability of the change we create— in our communities, across our districts, and within ourselves.

Unite for Good and Go forth to Create Lasting Impact.

K P Nagesh
RI Director 2025-27`,
  },
  {
    name: 'Muruganandam M',
    designation: 'Rotary International Director\n2025-27 (Zone 5 & 6)',
    year: 'Rotary International Vice President 2026-27',
    photo: mmmCouple, // Profile: MMM & Sumathi couple portrait
    // Shared uniform frame with the other profiles (`lp-photo--uniform`); his wide
    // landscape couple photo is cover-cropped to the box, trimming the side margins.
    profilePhotoVariant: 'lp-photo--uniform',
    messagePhoto: mmmPortrait, // Message: MMM solo headshot in the default frame
    // Fit the long profile onto exactly 2 sheets — the auto-fit shrinks the body to
    // the largest scale that still packs into 2 pages. Reliable now that the
    // measurement probes render the real (46%) photo frame, not the default one.
    profileMaxPages: 2,
    messageMaxPages: 1,

    profile: `Muruganandam M, affectionately called MMM (Triple M), is a Chartered Engineer with 3 decades of experience in Supply Chain Management. . He is the Chairman of the Excel Group of Companies which comprises diverse businesses such as Maritime & Shipping Logistics, Infra & Power projects, EXIM Services, HR, Job Portal, Tours and Events, Trading, Energy Sectors, Agro Farming, Healthcare and Renewable Power Projects.

His educational qualifications are Industrial Engineering from IIIE Mumbai, MS from BITS Pilani, MBA in Finance in IGNOU and Master of Foreign Trade from Pondicherry University. MMM was recognised as one of the Top 20 Most Inspiring Business Leaders by The CEO Magazine. His Excel Maritime & Logistics has received accolades like The Best Navigator (2012), by Times Group, Best Project Cargo Mover and C & F Agent, by Shipping Times of India, Top 10 Most Promising Companies in Logistics, Silicon Magazine, Best CSR by an Indian SME in the Economic Times MSME Awards 2022, Project Cargo Mover of the Year 2022 by Shipping Times and Top 10 Most Successful Logistics Brands 2023 by The Leaders Globe Magazine.

He holds a Lifetime Membership in prominent industrial engineering and renowned maritime and logistics forums. He is a proud alumnus of BITS Pilani and a member of the Trichy Rifle Club. MMM has emerged as a very successful entrepreneur, philanthropist and passionate Rotarian.

With “SAY YES TO ROTARY”, as his mantra, MMM began his Rotary journey as a Rotaractor at the age of 16. He won the Outstanding DRR of the World, became the Charter President of the Rotary Club of BHEL City Tiruchirappalli in 2008-09, and was elected as one of the youngest governors of RI District 3000 in 2016-17. MMM is known as the Guinness Governor for accomplishing 8 Guinness World Records commemorating TRF’s centennial year and he led the TRF Centennial Summit which was presided over by RI President Ian Riseley. By chartering 99 Rotaracts, 250 Interacts and 100 RCCs, he topped in Youth Service at the world level and bagged zonal awards for Membership Development, Public Image and contribution to the Rotary Foundation.

MMM became a Major Donor even before becoming a Rotarian. He has contributed 4,00,000 plus USD to The Rotary Foundation. MMM became the first Arch Klumph Society member of RI District 3000. His YES Team & Excel Foundation Endowment funds go towards literacy, health and hygiene projects. Through his generous TRF contributions, many noteworthy projects were executed as part of a Global Grants project and Term Gifts towards Polio eradication, providing Incinerators and RO plants to all the clubs of RI District 3000 in 2017-18, Low-Cost Dialysis Unit, ICU infrastructure, Upgrading a neonatal ICU ward and Milk Bank Equipment.

MMM has held significant positions such as Assistant Rotary Public Image Coordinator Zone 5 during 2020-21, Chairman of 2021 Rotary Zone Institute MAHABS, 2022 Hyderabad RI Presidential Conference Advisor and RI President’s Representative at the 3204 Calicut Conference. MMM chaired the 2023 Multi-District Rotary Leadership Conclave which was presided over by RI President Gordon McInally and the South Asian Reception at the 2023 RI Convention, in Melbourne. He served as the Zone 5 Rotary Public Image Coordinator during 2023-24.

MMM received the Citation for Meritorious Service from the Rotary Foundation and Rotary International’s Vocational Leadership Award. He received RI District 3000’s Distinguished Service Award from the Former Indian Vice-President Shri Venkaiah Naidu. He is a recipient of Rotary International’s highest honour Service Above Self Award.

MMM’s charitable endeavours extend through his organisation’s CSR initiative, The Excel Foundation, which works for the welfare of students, youngsters, special children, women, senior citizens and aspiring sportspersons consistently. The foundation sponsors educational scholarships for the children of quarry workers, provides financial assistance to the Spastics Society and underprivileged patients, and offers vocational training for women and youngsters. He was recognized as the Youth Icon and bestowed with the Life Time Achievement award from Trichy National College, the MDIO and Thesaigal NGO for his humanitarian services.

He is an eminent speaker dedicated to motivating youngsters, entrepreneurs, and Rotarians. He is frequently invited to address esteemed educational institutions, renowned business forums, and NGOs.

MMM is married to Sumathi, a commerce graduate and Excel Group of Companies Executive Director. The couple are blessed with a daughter, Priyadharshini, who is pursuing medicine, and a son, Praveen Karthick,pursuing Engineering, Both his children are Paul Harris Fellows. His wife, Sumathi, and daughter, Priyadharshini are members of the Rotary Club of BHEL City Tiruchirappalli.

He is the 2025-27 Rotary International Director. He is a Member of the Board Administration Committee and the Board Liaison Chair of the World Membership Growth Committee for 2025-26. He is a Member of the RI’s Executive Committee 2026-27 and TRF’s Member of the International PolioPlus Committee (IPPC) 2026-27, Director Liaison of the TRF Programs Committee 2026-27.

MMM is the first-ever contributor to the Paul and Jean Harris Home Foundation, marking a historic commitment to preserving the legacy and home of Rotary founder Paul Harris. After 71 years in the history of Rotary India, MMM has been selected as the Rotary International Vice President for 2026-27.

He is with a conviction to spread the glory of Rotary far and wide through his mission journey, Say YES to Rotary.`,
    message: `Dear DG Naimish N. Ravani,

As you assume leadership of Rotary International District 3055, Sumathi and I extend our warmest congratulations and best wishes to you and your spouse, Hemal N. Ravani, for a fulfilling and impactful Rotary year 2026–27. I am confident that under your guidance, the district will not only grow, but truly shine.

The theme “Create Lasting Impact”, given by RI President-elect Yinka Babalola, beautifully reminds us that Rotary is not about temporary solutions. It is about sustainable change. The world’s greatest example of this is Rotary’s historic fight against polio. What began as a bold idea has become a global movement—saving millions of lives and proving that when Rotarians commit, the impact is permanent.

Creating lasting impact also means building strong Rotary families for the future. I strongly encourage districts and clubs to embrace the strategic 1: 2: 3 vision— 1 Rotarian, 2 Rotaractors, and 3 Interactors. By welcoming youth early, we prepare tomorrow's Rotarians while energizing Rotary today.

Membership growth must not be about numbers alone. People are drawn to Rotary when they experience joy, purpose, fellowship, and visible impact. When communities feel the difference Rotary makes, membership follows naturally. Let us create clubs where members feel valued, inspired, and proud to belong.

In my thirty-five years in Rotary, I have seen one truth across cultures and continents—Rotary grows strongest where kindness leads, integrity guides, and service is heartfelt. District 3055 has immense potential to set such an example.

May this be a year where Rotary’s presence is felt deeply in every community, and its impact remembered for years to come.
Let’s Say YES to Rotary — and together, let’s Create Lasting Impact.

Best Regards,
Rtn AKS Er Muruganandam M (MMM)
B.E., M.B.A., M.S., MFT., PGDMM., DEM
Rotary International Vice President 2026-27
Rotary International Director 2025–27
Chartered Engineer
Chairman – Excel Group of Companies
#uniteforgood #sayyestorotary
#mmmtrichy #மாறு..!! மாற்று..!!
mmmtrichy | www.mmmtrichy.com`,
  },
  {
    name: 'Rtn. A.S. Venkatesh (Venky)',
    // Latest role heads the card; the term rides as the gold subtitle second line.
    designation: 'Trustee, The Rotary Foundation\n2026-30',
    photo: venkyCouple, // Profile: Venky & Vinita couple portrait (landscape)
    // Wide landscape couple photo → shared uniform frame, cover-cropped to the box.
    // `--shift-right` biases the crop left so his wife (on the left) isn't clipped.
    profilePhotoVariant: 'lp-photo--uniform lp-photo--shift-right',
    messagePhoto: venky, // Message: Venky solo headshot in the default frame
    profile: `An engineering graduate from IIT, Madras, Rtn. Venkatesh, with a Master's in Business Administration from IIM, Ahmedabad, entered the business of civil construction at the age of 23 and is currently heading an organization employing over 1400 people.

A member of the Rotary Club of Chennai Mambalam, he was its President in 2001-02, and District Governor of RI District 3230 in 2007-08. He was Rotary Coordinator for the period 2010-2013 for Zone 5 covering South India, Sri Lanka and Maldives.

He has been a trainer for all DGEs at the International Assembly for 2 years, as well as a trainer for all Coordinators for three years (2014-2017).

He served as Rotary International Director for the period 2021-2023. He was also Treasurer, Rotary International for 2022-2023. He served as Moderator for the International Assembly 2025, the first Indian ever to be so invited.

He has now been appointed to serve as a Trustee of The Rotary Foundation for the period 2026-2030.

He is a Level III Major Donor to The Rotary Foundation and all his family members are Paul Harris Fellows.

He is a keen Bridge player and loves travelling. He is married to Vinita, also an alumnus of IIM Ahmedabad. The couple have two daughters.`,
    message: `Dear DGE Naimish,

Warm greetings to you as you prepare to take on one of the most significant leadership roles in Rotary. It is an opportunity to leave a legacy of impactful service that will last beyond your year in office.

Your leadership will enable clubs to convert intention into impact. The Rotary Foundation may give all of us the tools, but your passion and commitment can bring it to life. While you encourage and promote giving to TRF and doing meaningful projects, I urge you also to emphasize stewardship of the project undertaken.

You have the power to turn aspirations into accomplishments. Use it to Create Lasting Impact.

With warm regards,
A.S. Venkatesh (Venky)
R.I. Director (2021-2023)
R.I. Treasurer (2022-2023)
Moderator, International Assembly 2025
TRF Trustee (2026-2030)`,
  },
  {
    name: 'Naimish N. Ravani',
    // "District Governor" and its term "2026-27" are one title unit, so the term
    // rides as a second line in `designation` — rendered as the gold `.lp-subtitle`
    // tucked beneath the gold title — instead of the navy, wider-gapped `year`.
    // (Same treatment as Shyam Kumar's "District Governor Elect\n2026-27" below.)
    designation: 'District Governor\n2026-27',
    messageBodyFontDeltaPx: 1, // body copy 1px larger than the auto-fitted size
    photo: naimishCouple, // Profile: Naimish & Hemal Ravani couple portrait
    // Same uniform profile-photo frame as Babalola (46% × 170/220); object-fit: cover
    // crops the extra wall/background space so the couple fills the box.
    profilePhotoVariant: 'lp-photo--uniform',
    // Message: DG Naimish's solo headshot (event portrait, rotated upright); the
    // couple portrait above stays on the Profile page only.
    messagePhoto: naimishMessage,
    profile: `Naimish N Ravani was born in a prestigious political family of Former Member of Parliament and Former Minister of Gujarat State, Late Shri Navinchandra Ravani and hence Social Service and Leadership are his inherited qualities.

After completing his graduation in economics from St. Xavier's College, Ahmedabad, Naimish attained a degree of post graduate diploma in International Business Management from Bhavan's Ahmedabad.

Naimish is engaged in his family businesses spread in real estate, health care and IT sector.

Naimish happily lives with his wife Hemal, two lovely daughters Niyati and Kavya along with a joint family of 25 people, spread across 4 generations.

Rtn. Naimish N Ravani is a Rotarian since 2010 when he became a chartered member of his vibrant home club Rotary Club of Ahmedabad Supreme. He served as president of his club in 2018-19. In the RY 2020-21 he served as Assistant Governor in erstwhile RID 3054. Rtn. Naimish has served as Chairman of various District Committees from 2014-15 till date.

Through his total donations of US Dollars 50,000/-, Rtn. Namish and his wife Rtn. Hemal are Major Donor of Level - 3 of The Rotary Foundation and both of them are Benefactor of The Rotary Foundation.

Naimish believes in the Rotary motto of "Service above Self" and he is ever ready to help and support.

A True Rotarian By Nature, Values and Ideology.`,
    message: `Dear Rotarians,

As we step into Rotary Year 2026–27, I extend my warmest greetings and heartfelt best wishes to every member of our Rotary family.

Rotary has always been more than an organization—it is a movement of compassion, commitment, and collective action. Each one of you carries the power to transform lives through your dedicated approach of Service Above Self.

As we begin this new journey together, let us remember what Mahatma Gandhi preached us,

"The best way to find yourself is to lose yourself in the service of others."

There is a timeless line from the beloved song "Kisiki Muskurahaton Pe Ho Nisar" that beautifully reflects the very soul of Rotary:

"Kisiki muskurahaton pe ho nisaar, Kisika dard mil sake toh le udhaar, Kisike Vaste ho tere dil me Pyar, .......Jina isika naam hai."

These words capture the essence of what it means to be a Rotarian — to dedicate ourselves to bring smiles to others and to willingly share the burden of those in need.

This is the true spirit of Service Above Self.

Every project we undertake, every hand we extend, and every life we touch becomes a reflection of Rotary's enduring commitment to humanity.

Let Rotary Year 2026–27 be a year of purposeful action, stronger fellowship, innovative service projects, and meaningful transformation to Create Lasting Impact.

Together, let us continue to inspire, strengthen communities, and create countless smiles through our service.

Wishing each Rotary club and every Rotarian; a fulfilling, impactful, and successful rotary year ahead.

Service Above Self — Always and in all ways.

Warm regards,
Naimish N. Ravani
District Governor 2026–27, RID 3055`,
  },
  {
    name: 'Rtn. K.A. Shyam Kumar',
    // "2026-27" is a continuation of the title, so it rides in the designation as a
    // second line — rendered as the gold `.lp-subtitle` tucked tight beneath "District
    // Governor Elect" — instead of the navy, wider-gapped `year`. Affects his profile
    // and message alike (both render this designation); no `year` set here on purpose.
    designation: 'District Governor Elect\n2026-27',
    photo: shyamKumarCouple, // Profile: Shyam Kumar & Uma Shyam couple portrait
    // His couple photo is a wide shot with the two standing far apart, so the
    // portrait `lp-photo--wide` crop sliced his wife off the right edge.
    // `lp-photo--couple` reshapes the frame to a landscape aspect showing both faces.
    profilePhotoVariant: 'lp-photo--face lp-photo--couple',
    messagePhoto: shyamKumar, // Message: Shyam Kumar solo headshot in the default frame
    profile: `Shyam Kumar is a distinguished educationist with over 30 years of experience in the field of academics. He is the Founder and Director of St. John's School, Abu Road—a premier CBSE-affiliated senior secondary residential institution.

Born in Kollam district, Kerala, and brought up in Hyderabad, he is a graduate of Osmania University. He is now settled in Abu Road, Rajasthan.

Rtn. Shyam Kumar's Rotary journey spans more than 23 years. He joined the Rotary Club of Abu Road as Charter Secretary in 2002-03, served as Club President in 2006-07, and went on to serve as Assistant Governor in 2007-08. He has worked on several positions, particularly in areas related to Interact, Rotaract, RYLA, and Youth Protection in District.

He is the proud recipient of several Rotary honors, including the Rotary International's Four Avenues of Service Citation.

Rtn. Shyam Kumar and his wife Rtn. Uma Shyam, who is also an accomplished educator and Rotarian, are Level 2 Major Donors to The Rotary Foundation. The couple is blessed with two sons—Priyank, a research scientist based in Denmark, and Harshaal, a professional chef settled in the UK.

Rtn. Shyam Kumar is passionate about golf and travel.

He will be serving as District Governor of Rotary International District 3055 for the Rotary Year 2027-28 with vision & dedication for service above self.`,
    message: `Dear DG Naimish,

As I extend my heartfelt congratulations and best wishes to you and the entire Team Nirman, I am reminded that every meaningful achievement begins with a strong foundation. The theme Nirman beautifully symbolizes the continuous process of creating, nurturing, and transforming communities through service above self.

You embody the true spirit of Rotary. Your unwavering dedication, compassionate leadership, and deep passion for serving society has inspired many to believe that lasting change is possible when purpose meets action. Your commitment to humanitarian service, coupled with your ability to bring people together, reflects the very essence of Rotary.

I am confident that under your dynamic leadership, Team Nirman will build impactful projects and also strengthen relationships, inspire new leaders, and create a legacy of hope and service across the district.

May this year be filled with meaningful accomplishments, innovative initiatives, and countless opportunities to touch lives and transform communities.

Wishing you and Team Nirman a remarkable year of service, growth, and enduring impact.

Yours in Rotary,
Rtn. K.A. Shyam Kumar
District Governor Elect`,
  },
  {
    name: 'PHF Rtr. Aneri Bhatt',
    designation: 'Unicorn District Rotaract Representative\n2026-27',
    photo: aneriBhatt,
    profile: `What began eight years ago as a simple desire to serve society has today evolved into a remarkable journey of leadership, creativity, and impact. PHF Rtr. Aneri Bhatt, a proud member of the Rotaract Club of Ahmedabad Elysium, now stands at the helm of Rotaract District 3055 as the Unicorn District Rotaract Representative for RIY 2026-27.

A Visual Designer by profession and a creator by passion, Aneri believes that creativity is not merely an ability—it is a way of life. Known for her eye for detail, innovative thinking, and pursuit of perfection, she has consistently transformed ideas into experiences that are aesthetic, meaningful, and memorable.

Her entrepreneurial spirit led her to establish Kala Junction, a creative venture that celebrates artistry in all its forms. From handcrafted gifts and customized creations to engaging workshops and artistic experiences, Kala Junction reflects her belief that creativity has the power to connect, inspire, transform and most importantly heal.

Throughout her Rotaract journey, Aneri has embraced every responsibility with dedication and excellence. She has never been defined by a designation; instead, she has redefined every role she has undertaken through her commitment, vision, and ability to create lasting impact.

A leader who leads with both heart and imagination, Aneri is admired for her relentless passion, unwavering work ethic, and exceptional ability to bring people together. Her dream tenure is guided by the inspiring message: "EMERGE AS UNICORN"—a call for every individual to discover their uniqueness, embrace their potential, and rise beyond limitations.

A true embodiment of passion, precision, leadership, and powerful creativity, PHF Rtr. Aneri Bhatt continues to inspire others to dream boldly, create fearlessly, and lead meaningfully.`,
  },
  {
    name: 'Rtn. Vikram Thakkar',
    designation: 'District Governor Nominee\n2028-29',
    photo: vikramCouple, // Profile: Vikram & Sita Thakkar couple portrait
    // Shared uniform frame with the other profiles (`lp-photo--uniform`); his tall
    // couple portrait is cover-cropped to the box, trimming extra headroom/foreground.
    profilePhotoVariant: 'lp-photo--uniform',
    messagePhoto: vikram, // Message: Vikram solo headshot in the default frame
    messageBodyFontDeltaPx: 1, // message body copy 1px larger than the auto-fitted size
    // Profile fitted onto a SINGLE sheet at Babalola's fixed body size (1.8014cqw)
    // with the same tightened leading, instead of paginating across two pages.
    profileBodyFontCqw: 1.8014,
    profileBodyLineHeight: 1.14,
    profile: `Rtn. Vikram Thakkar began his Rotary journey in 1998 as a young participant in the Rotary Youth Leadership Awards (RYLA) program. Inspired by the values of Rotary, he became a member of the Rotary Club of Deesa in 2001 and has remained an active and dedicated Rotarian for more than two decades.

He has served the Rotary Club of Deesa as Club Secretary (2003–04) and Club President (2007–08), and later as Assistant Governor of Rotary International District 3054 during 2018–19. A passionate advocate for youth development, he has been actively associated with the club's flagship RYLA program and played a key role in making the Rotary Club of Deesa a 100% Paul Harris Fellow Club during its Golden Jubilee year.

At the district level, Rtn. Vikram has held several important leadership positions, including District Additional Secretary, District RYLA Chair, Foundation District Secretary, Regional Coordinator, and Additional District Secretary – The Rotary Foundation (TRF), among others.

A humble industrialist by profession, he is engaged in the manufacturing, import, and export of dal (pulses), guar gum, edible oils, and agricultural commodities. He also serves as Vice President of the Banaskantha District Chamber of Commerce, Vice President of the Gujarat Moong Dal Mill Association, Trustee of Sanskar Mandal, Deesa, and Vice President of the Vishva Hindu Parishad, Deesa District.

Rtn. Vikram is supported by his wife, Mrs. Sita Thakkar, who recently became a member of the Rotary Club of Deesa and is also a Paul Harris Fellow. They are blessed with two daughters, Vishwa and Chelsea, both of whom have actively participated in Rotary Youth Exchange Programs.

His commitment to The Rotary Foundation is reflected in his recognition as a Multiple Paul Harris Fellow (MPHF +6).

In recognition of his dedicated service and long-standing fellowship with Rotarians across the district, the members of Rotary International District 3055 have elected Rtn. Vikram Thakkar as the District Governor for the Rotary Year 2028–29. With a clear vision to expand Rotary's impact in society while upholding its enduring motto, "Service Above Self," he is committed to leading the district with integrity, innovation, and purpose.`,
    message: `Dear Rotary Family,

It is a matter of great pride and pleasure to extend my heartfelt greetings through this District Directory under the leadership of District Governor Rtn. Naimish N. Ravani.

A district directory is much more than a collection of names and contact information; it is a reflection of our Rotary family, our collective strength, and our commitment to Service Above Self. It serves as a valuable bridge that connects Rotarians across clubs, fostering fellowship, collaboration, and meaningful service opportunities.

As we prepare for the Rotary year 2026-27, inspired by the RI President's message, "Create Lasting Impact," I am confident that under the dynamic leadership of DG Rtn. Naimish Ravani, The Rising Sun of Rotary District 3055, our district will continue to grow stronger, reach greater heights, and create meaningful and sustainable change in our communities.

His vision, dedication, humility, and passion for Rotary inspire all of us to dream bigger, serve better, and lead with purpose.

Rotary today stands as a global force for good with more than 1.2 million members across the world. Through our focus on membership growth, The Rotary Foundation, youth empowerment, peacebuilding, disease prevention, education, environmental sustainability, and community development, we have the power to transform lives and bring hope where it is needed most.

I encourage every Rotarian to utilize this directory as a tool to strengthen relationships, exchange ideas, and collaborate on service projects that truly Create Lasting Impact. Together, we can build stronger clubs, develop future leaders, and expand Rotary's reach and influence.

I congratulate DG Rtn. Naimish N. Ravani and the entire District Directory Team for their dedicated efforts in bringing out this valuable publication. May this directory serve as a source of connection, inspiration, and Rotary fellowship throughout the year.

As the sun rises each day bringing new hope and opportunities, may the leadership of our Rising Sun, DG Naimish N. Ravani, illuminate the path for Rotary District 3055 and inspire all of us to achieve new milestones in service and fellowship while continuing to Create Lasting Impact.

Yours in Rotary Service,
Rtn. Vikram Thakkar
District Governor Nominee (2028-29)
Rotary District 3055`,
  },
  {
    name: 'Rtn. Dr. J. P. Vyas',
    designation: 'District Learning Facilitator\n2026-27',
    photo: jpVyas, // Single portrait — used for the message (no separate messagePhoto).
    message: `Dear Naimish, Hemal and Friends in Service,
Rotary Greetings!

As we begin this new Rotary year, let us embrace the spirit of NIRMAN—a year of building, creating and leaving a lasting impact through our service.

This year, Rotary International calls upon us to Create Lasting Impact. Let this powerful message inspire us to turn compassion into action, ideas into meaningful initiatives and service into transformation that continues far beyond our individual efforts.

As Rotarians, let us uphold the timeless spirit of Service Above Self and work together to strengthen communities, empower lives and create a better tomorrow.

May NIRMAN, inspire us to build not just projects, but possibilities; not just communities, but a legacy of positive change.

Let us serve together with purpose, lead with compassion and create lasting impact.

Neeta joins me in wishing each one of you a fulfilling, inspiring and impactful Rotary year ahead.

Yours in Rotary,
Rtn. Dr. J. P. Vyas
District Learning Facilitator, 2026–27`,
  },
  {
    name: 'Rtn. Dr. Geetika Saluja',
    designation: 'Chairperson — District Directory Committee\n2026-27',
    photo: geetikaSaluja,
    message: `Dear Rotarians,

Greetings!

"We should not live for ourselves alone, but for the joy in doing good for others." — Arch Klumph

It gives me immense pleasure to present the District Directory, a powerful resource designed to help us connect for good and collaborate for greater impact.

More than just a compilation of names and contact details, this directory is a gateway to opportunities, relationships, and service. It brings together valuable information about Rotarians, clubs, district leaders, committees, and key resources, making it easier to identify expertise, discover opportunities, and build meaningful partnerships.

Whether you are looking to:
• Connect with fellow Rotarians across clubs, districts, and zones
• Find resource persons, mentors, speakers, or project partners
• Explore joint service initiatives and global collaborations
• Strengthen fellowship and professional networking
• Plan engagements at the Club, District, Zone, or Rotary International level

This directory will serve as your handy companion throughout the year.

I encourage every Rotarian to use this resource to explore, connect, collaborate, and create lasting impact through service.

My sincere thanks to the District Directory Committee Co-chairs, the Office of the District Governor, and all Rotarians of RID 3055 for their prompt support in data collection. I am especially grateful to DG Naimish Ravani Ji for his trust, guidance, and shared vision. His leadership and confidence in the team have been instrumental in bringing this valuable resource to fruition.

Let us make the most of this collective network as when Rotarians connect with purpose, possibilities become limitless.

Warm regards,
Rtn. Dr. Geetika Saluja
Chairperson – District Directory Committee, RID 3055`,
  },
  {
    name: 'Varsha Bhavesh Shah',
    designation: 'District Chairman — Inner Wheel District 3055',
    year: '2026-27',
    photo: varshaShah,
    profile: `Born and raised in the heritage city of Ahmedabad, the birthplace of the first Inner Wheel Club in India, Varsha Shah embodies the values of service, leadership, and compassion. A Commerce graduate, she is married to renowned businessman Bhavesh Shah and is blessed with a loving family, including her two children and grandson, Nemiraj.

A trained Indian Classical vocalist holding the Visharad degree, Varsha is also a passionate nature and bird photographer, reflecting her appreciation for beauty, patience, and perseverance.

Her journey in community service began in 2008 as President of the Lioness Club of Naranpura, where she received the Best President and Child Welfare Awards. Deeply committed to education, she has volunteered with underprivileged children and completed a correspondence course in Teaching Techniques from the University of London.

Joining the Inner Wheel Club of Ahmedabad South in 2013, she has led several impactful initiatives, including supporting education for underprivileged children, empowering visually impaired women through entrepreneurship, and providing shelter umbrellas for traffic police personnel.

As Club President (2020–21), she led her club to win eight District Awards, including Best President, Manorama Kansal Award, Sudha Gerg Memorial Award, Swarna Rachna Jalnidhi Award, and the Environmental & Childcare Award.

Her distinguished Inner Wheel journey includes serving as District ISO (2022), District Editor (2023), District Secretary (2024), and District Vice Chairman (2025). During her tenure as District ISO, her club successfully hosted the District Conference "Hosala" and donated 14 Pink Autorickshaws to empower women.

Beyond Inner Wheel, Varsha actively serves through the Karunakare Foundation, is a member of the Executive Committee of FICCI FLO, and an active member of the Femina Club. Guided by compassion and inspired by service, she continues to make a meaningful impact through her dedication to empowering communities and uplifting lives.`,
  },
]
