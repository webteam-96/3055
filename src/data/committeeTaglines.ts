// Short committee descriptions shown as a 20px subtitle beneath the title on each
// committee title/divider page in the Download-All PDF. Text is verbatim from the
// client-supplied "District_3055_Committees_Short.docx" (2026); only whitespace was
// normalised. Keyed by the committee separator title (see
// committeeSeparators.SEPARATOR_TITLES) and matched case/punctuation-insensitively, so
// spelling variants (DLF, Water Sanitation, Economic & Community Development, the
// service-trust number, etc.) all resolve to the right text.
//
// Titles NOT present in the source document have no entry here and therefore render no
// subtitle: Council of Governors, Regional Co-ordinators, Zonal Teams, and the section
// covers (Profile & Message, Rotary Clubs of District 3055, Rotary Information).

const TAGLINES: Record<string, string> = {
  "District Guiding Force": "The Governor, Governor-Elect, Governor-Nominee, Patrons, Mentors and Advisors set the district's vision in line with the RI Action Plan and NIRMAN theme. They guide club presidents, resolve concerns fairly and ensure ethical, steady leadership for every club.",
  "District Secretariat": "The Secretary General, Additional Secretaries and Sergeants-at-Arms run daily administration, RI and club correspondence, records, reporting and events. They are clubs' single point of contact, helping secretaries meet deadlines, stay compliant and keep protocol.",
  "DLF": "The DLF team plans learning seminars, assemblies and workshops using RI's learning resources. They nurture and mentor Rotarians for leadership to lead confidently.",
  "District Finance Committee": "Prepares and monitors the district budget, oversees funds and audits under the RI Code of Policies. It advises clubs on sound financial practice and dues, keeping every contribution transparent and accountable.",
  "District Directory Committee": "Compiles, verifies and publishes the annual District Directory with accurate club, leader and committee details, respecting privacy. It gives Rotarians a reliable tool to network, find expertise and collaborate.",
  "GML - Governor’s Monthly Letter Committee": "The editorial team produces the Governor's Monthly Letter, sharing district priorities, RI themes, deadlines and club achievements. It keeps every Rotarian informed, recognised and united.",
  "RI District 3051 Service Trust": "Manages the district's charitable funds for service and relief projects with transparent accounts, audits and legal compliance. It gives clubs a trusted platform for donations and joint projects.",
  "District Special Projects": "Leads the Governor's flagship campaigns: cancer awareness, vaccination, hair donation, prosthetics, addiction prevention, organ donation and CSR. Regional Coordinators give clubs toolkits, experts and partners.",
  "Rotary Priority": "Drives membership attraction, engagement, retention, orientation, women's membership and new club development. They mentor clubs, welcome new members and keep clubs active, inclusive and growing.",
  "The Rotary Foundation - RIY": "Promotes giving to The Rotary Foundation through Annual Fund, Endowment, Grants, Polio Plus, Stewardship and other sub-committees. It trains club Foundation chairs, guides grant applications and recognises donors.",
  "Public Image": "Strengthens Rotary's brand through media, the district website and social media, following RI brand guidelines. It helps clubs publicise projects and attract volunteers, partners and members.",
  "Service Projects": "Encourages needs-based, sustainable Community and Permanent Projects. It guides clubs in planning, finding partners and documenting results so service leaves a lasting legacy.",
  "Peace Building & Conflict Prevention": "Promotes peace education, mediation, legal awareness and Rotary Peace Fellowship applications. It runs workshops and helps clubs build understanding and resolve conflict constructively.",
  "Disease Prevention & Treatment": "Promotes health awareness, screening and treatment on thalassemia, TB, blood donation, mental health, fluorosis and blindness. It helps clubs run safe camps with medical experts and follow-up care.",
  "Water Sanitation & Hygiene": "Brings safe water, sanitation and hygiene to communities, schools, health facilities and adolescent girls. It advises clubs on project design, training and maintenance so results last.",
  "Basic Education & Literacy - BEL": "Improves literacy and education through Vibrant Schools, Anganwadi adoption and ICT labs. It helps clubs assess needs, support teachers and partner with education authorities.",
  "Maternal & Child Health": "Reduces maternal and child health risks through antenatal care, nutrition, girl child health and vaccination. It connects clubs with doctors and hospitals to run camps and drives.",
  "Economic Community Development": "Builds livelihoods through skill centres, the Rotary Start-Up Cell, digital awareness and government grants. It mentors entrepreneurs and connects clubs with training partners and schemes.",
  "Environment": "Protects the environment through tree plantation, e-waste management, Go Green, rainwater harvesting and climate-health awareness. It gives clubs action plans and expert contacts.",
  "Club Service": "Helps clubs run well through administration, the Club Leadership Plan, classification and celebrations such as Charter Day. It guides officers on RI rules, protocol and fellowship.",
  "Vocational Service": "Encourages Rotarians to serve through their professions and follow the Four-Way Test. It runs vocational awards, ethics workshops and entrepreneurship training and mentoring.",
  "Community Service": "Improves local life through Resilient Villages, women's empowerment, road safety, health camps and Industry Connect. It shares project models and partners so clubs deliver visible impact.",
  "International Service": "Builds goodwill across borders via Youth Exchange, Friendship Exchange, RI Convention promotion and inter-district fellowship. It helps clubs find overseas partners and run safe exchanges.",
  "Youth Service": "Develops young leaders through Rotaract, RYLA and New Generation Service Exchange, under Rotary's youth protection policy. It mentors youth clubs and guides safe programmes.",
  "District Priority": "Runs the Governor's signature initiatives: Rotary Community Corps, Sports Fellowship, Cyclotron and Project Pink Pulse. It gives clubs event plans and publicity to take part together.",
  "District Core Committees": "Ensures fair governance through elections, credentials, balloting, awards, DEI, strategic planning, grievances, resolutions and bylaws. It applies RI rules impartially so members can trust decisions.",
  "District Other Important Committees": "Strengthens leadership and fellowship through RLI, conference, events, career counselling, historian, spouse engagement, RMB and Rotary fellowships. It keeps members engaged, connected and informed.",
}

const norm = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
const BY_NORM = new Map<string, string>(Object.entries(TAGLINES).map(([k, v]) => [norm(k), v]))

/** The short description for a committee title page, or undefined when the source
 *  document has no text for that title. */
export function subtitleForTitle(title: string): string | undefined {
  return BY_NORM.get(norm(title))
}
