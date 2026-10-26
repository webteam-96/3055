// Rotary District 3055 — District Goals & AOP Targets, transcribed VERBATIM from
// "District Goals.xlsx" (Sheet1). Two titled tables, each a set of lettered
// sections (A–J, plus the un-lettered "PHF / MPHF" block) with numbered items.
// Goal values are exactly as displayed in the sheet (percentages, USD figures,
// Indian-format numbers and free text are all preserved). A few source rows carry
// a serial number with an empty Particulars/Goal — those blanks are kept as-is so
// nothing is added or removed. Single source of truth for the /district-goals page.

export interface DGItem {
  /** Serial number as printed. */
  sr: string
  particulars: string
  /** Goal exactly as displayed in the sheet. */
  goal: string
}

export interface DGSection {
  /** Section band label (letter + name, e.g. "A. Events"; "PHF / MPHF" has no letter). */
  band: string
  items: DGItem[]
}

export interface DGTable {
  title: string
  sections: DGSection[]
}

export const DISTRICT_GOAL_TABLES: DGTable[] = [
  {
    title: 'Rotary District 3055 – District Goals',
    sections: [
      {
        band: 'A. Events',
        items: [
          { sr: '1', particulars: 'Clubs presence in DTA', goal: '100%' },
          { sr: '2', particulars: 'Concerned leaders of clubs attend Dist. Seminars', goal: '100%' },
          { sr: '3', particulars: 'Clubs presence in Dist. Conference', goal: '100%' },
        ],
      },
      {
        band: 'B. Club Administration',
        items: [
          { sr: '1', particulars: 'My Rotary registration of all members of club', goal: '100%' },
          { sr: '2', particulars: 'Vocation Info. of all members of club', goal: '100%' },
          { sr: '3', particulars: 'Club qualification for Grant Management Seminar', goal: '100%' },
          { sr: '4', particulars: 'Clubs Set Goals on My Rotary', goal: '100%' },
          { sr: '5', particulars: 'Clubs ensure R.I. Citation', goal: '100%' },
          { sr: '6', particulars: 'Clubs ensure DG Citation', goal: '100%' },
        ],
      },
      {
        band: 'C. Events',
        items: [
          { sr: '1', particulars: 'Membership', goal: '2' },
          { sr: '2', particulars: 'Public Image', goal: '1' },
          { sr: '3', particulars: 'The Rotary Foundation', goal: '2' },
          { sr: '4', particulars: 'CSR', goal: '1' },
          { sr: '5', particulars: 'Polio', goal: '1' },
          { sr: '6', particulars: 'Grant Management', goal: '1' },
          { sr: '7', particulars: 'New Membership Orientation', goal: '2' },
          { sr: '8', particulars: 'RYLA', goal: '2' },
          { sr: '9', particulars: 'Interact Conference', goal: '1' },
          { sr: '10', particulars: 'RCC Conference', goal: '1' },
          { sr: '11', particulars: 'All Women Conference', goal: '1' },
          { sr: '12', particulars: 'RLI - Rotary leadership Institute', goal: '2' },
        ],
      },
      {
        band: 'D. Membership',
        items: [
          { sr: '1', particulars: 'Net growth in membership', goal: '500' },
          { sr: '2', particulars: 'Retention in membership', goal: '90%' },
          { sr: '3', particulars: 'Women membership', goal: '15%' },
          { sr: '4', particulars: 'Clubs with min. 4 Women rotarians.', goal: '50%' },
          { sr: '5', particulars: 'Growth in SSSS membership', goal: '20%' },
          { sr: '6', particulars: 'New Rotary club', goal: '20' },
          {
            sr: '7',
            particulars:
              'New Rotary Club of special category: Next Gen, Caused based, Fellowship based, All couple, Majority women club',
            goal: '2',
          },
          { sr: '8', particulars: 'New Rotaract club', goal: '10' },
          { sr: '9', particulars: 'New Interact club', goal: '30' },
          { sr: '10', particulars: 'New RCC', goal: '11' },
          { sr: '11', particulars: 'Clubs with less then 10 members', goal: '20' },
          { sr: '12', particulars: 'Clubs with more then 25 members', goal: '80%' },
          { sr: '13', particulars: 'Bringing down average age of members by years', goal: '3 years' },
        ],
      },
      {
        band: 'E. TRF',
        items: [
          { sr: '1', particulars: 'Total contribution to TRF', goal: '10,00,000 USD' },
          { sr: '2', particulars: 'Total Annual Fund contribution', goal: '2,00,000 USD' },
          { sr: '3', particulars: 'Club contribution to TRF', goal: '100%' },
          { sr: '4', particulars: 'Club contribution to Polio', goal: '100%' },
          { sr: '5', particulars: 'AKS', goal: '2' },
          { sr: '6', particulars: 'Endowment Fund', goal: '3' },
          { sr: '7', particulars: 'Major Donors', goal: '15' },
        ],
      },
    ],
  },
  {
    title: 'Rotary District 3055 – AOP Targets',
    sections: [
      {
        band: 'PHF / MPHF',
        items: [
          { sr: '8', particulars: 'PHF / MPHF', goal: '400' },
          { sr: '9', particulars: 'Paul Harris Society Members', goal: '25' },
          { sr: '10', particulars: 'Polio Plus Society Members', goal: '50' },
          { sr: '11', particulars: 'Total Polio fund', goal: '10000 USD' },
          { sr: '12', particulars: 'CSR project with RFI', goal: '15' },
          { sr: '13', particulars: 'Clubs with Per capita 25 $ donation to TRF', goal: '25' },
        ],
      },
      {
        band: 'F. Public Image',
        items: [
          { sr: '1', particulars: 'Clubs maintaining & uploading social media accounts', goal: '75%' },
          { sr: '3', particulars: 'Clubs having brand compliant websites', goal: '30%' },
          { sr: '4', particulars: 'Clubs having events or programs appearance in news papers', goal: '70%' },
          { sr: '6', particulars: 'Organize public rallies/ marathons/ human chains', goal: '8' },
          { sr: '7', particulars: 'Clubs releasing bulletins', goal: '30%' },
          { sr: '8', particulars: 'Hoardings, Wall paintings', goal: '50' },
        ],
      },
      {
        band: 'G. Service Projects',
        items: [
          { sr: '1', particulars: 'Gyan-Setu: Refurbished computers distribution', goal: '600' },
          { sr: '4', particulars: 'Blood Donation-Units', goal: '11000' },
          { sr: '5', particulars: 'Medical Mission', goal: '5' },
        ],
      },
      {
        band: 'H. DG Focused Projects:',
        items: [
          { sr: '1', particulars: 'Cancer awareness programs', goal: '7' },
          { sr: '2', particulars: 'Cervical cancer vaccination', goal: '50000' },
          { sr: '3', particulars: 'Anti Drug awareness drive to students', goal: '110000' },
          { sr: '4', particulars: 'Artificial Limbs', goal: '250' },
          { sr: '5', particulars: 'CSR projects', goal: '15' },
        ],
      },
      {
        band: 'I. Rotary Area of Focus:',
        items: [
          { sr: '1', particulars: 'Teachers training', goal: '250' },
          { sr: '2', particulars: 'Skill development centers', goal: '10' },
          { sr: '4', particulars: 'ICT Labs', goal: 'SUPPORT – 20' },
          { sr: '5', particulars: 'Environment Sustainablity-Solar Panel Installation', goal: '(500 homes*2kw)1000kw' },
          { sr: '6', particulars: 'Dialysis Centres', goal: 'Machine – 10' },
          { sr: '7', particulars: 'Cataract Surgeries', goal: '1000' },
          { sr: '8', particulars: 'Permanent Service projects - New', goal: '4' },
        ],
      },
      {
        band: 'J. Programs:',
        items: [
          { sr: '1', particulars: 'Rotary Friendship Exchange - International', goal: '2' },
          { sr: '2', particulars: 'Rotary Friendship Exchange - Inter District', goal: '5' },
          { sr: '3', particulars: 'Rotary Friendship Exchange - Intra District', goal: '3' },
          { sr: '4', particulars: 'Youth Exchange - Outbound - STEP', goal: '20' },
          { sr: '5', particulars: 'Youth Exchange - Inbound - STEP', goal: '20' },
          { sr: '6', particulars: 'Celebration of Rotary Day/week', goal: '100%' },
        ],
      },
    ],
  },
]
