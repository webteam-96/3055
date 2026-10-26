// Rotary "Regional Leaders" for Zone 4, extracted from
// https://rizones45678.org/regional-leaders (Zone 4 Directory tab).
//
// The source page groups leaders by FUNCTIONAL AREA (Membership, Public Image,
// The Rotary Foundation, E/MGA, EPNC); within each area by ROLE; and lists each
// person as District · Name · DG tenure year. No emails/phones are published on
// that page, so only these fields are available. This is the single source of
// truth for the /rotary-leaders-zone4 page.

export interface Zone4Leader {
  /** Rotary district number, e.g. "3055". */
  district: string
  /** Full name including honorifics as published (PDG / Rtn. / Rtr. / AKS …). */
  name: string
  /** DG tenure year, e.g. "2022-23"; null when the source lists none. */
  term: string | null
}

export interface Zone4Role {
  /** Full role title, e.g. "Assistant Rotary Co-ordinator". */
  title: string
  /** Abbreviation as shown on the source page, e.g. "ARC". */
  abbrev: string
  people: Zone4Leader[]
}

export interface Zone4Area {
  /** Functional area, e.g. "Membership". */
  area: string
  roles: Zone4Role[]
}

export const ZONE4_AREAS: Zone4Area[] = [
  {
    area: 'Membership',
    roles: [
      {
        title: 'Rotary Membership Co-ordinator',
        abbrev: 'RMC',
        people: [{ district: '3070', name: 'PDG Dushyant Choudhary', term: '2022-23' }],
      },
      {
        title: 'Plan Lead – Membership',
        abbrev: 'Plan Lead',
        people: [{ district: '3056', name: 'PDG Anil Agarwal', term: '2013-14' }],
      },
      {
        title: 'Assistant Rotary Co-ordinator',
        abbrev: 'ARC',
        people: [
          { district: '3011', name: 'PDG Vinay Bhatia', term: '2018-19' },
          { district: '3141', name: 'PDG Arun Bhargava', term: '2023-24' },
          { district: '3055', name: 'PDG Mohan Parashar', term: '2024-25' },
          { district: '3056', name: 'PDG Nirmal Kumar Singhvi', term: '2006-07' },
          { district: '3080', name: 'PDG Rajpal Singh', term: '2024-25' },
          { district: '3053', name: 'PDG Rahul Srivastav', term: '2024-25' },
        ],
      },
    ],
  },
  {
    area: 'Public Image',
    roles: [
      {
        title: 'Regional Public Image Co-ordinator',
        abbrev: 'RPIC',
        people: [{ district: '3141', name: 'PDG Subhash Kulkarni', term: '2015-16' }],
      },
      {
        title: 'Assistant Regional Public Image Co-ordinator',
        abbrev: 'ARPIC',
        people: [
          { district: '3060', name: 'Rtr. Rtn. Rohit Ajmera', term: null },
          { district: '3080', name: 'PDG Tarsem Kumar Ruby', term: '2017-18' },
          { district: '3090', name: 'PDG Ghansham Kansal', term: '2023-24' },
          { district: '3053', name: 'PDG Pawan Khandelwal', term: '2023-24' },
          { district: '3142', name: 'PDG Chandu Kolvekar', term: '2016-17' },
          { district: '3011', name: 'Rtn. Padmini Parameshwaran', term: null },
        ],
      },
    ],
  },
  {
    area: 'The Rotary Foundation',
    roles: [
      {
        title: 'Regional Rotary Foundation Co-ordinator',
        abbrev: 'RRFC',
        people: [{ district: '3012', name: 'Sharat Jain', term: '2016-17' }],
      },
      {
        title: 'Assistant Regional Rotary Foundation Co-ordinator',
        abbrev: 'ARRFC',
        people: [
          { district: '3142', name: 'PDG Dinesh Mehta', term: '2024-25' },
          { district: '3056', name: 'PDG Dr. Nirmal Jain Kunawat', term: '2023-24' },
          { district: '3012', name: 'PDG Ashok Aggarwal', term: '2021-22' },
          { district: '3070', name: 'PDG Sunil Nagpal', term: '2019-20' },
          { district: '3060', name: 'PDG Tushar Shah', term: '2024-25' },
          { district: '3141', name: 'PDG Chetan Desai', term: '2024-25' },
        ],
      },
    ],
  },
  {
    area: 'E/MGA',
    roles: [
      {
        title: 'Endowment & Major Gifts Advisor',
        abbrev: 'E/MGA',
        people: [{ district: '3060', name: 'PDG Ashish Ajmera', term: '2014-15' }],
      },
      {
        title: 'Assistant Endowment & Major Gifts Advisor',
        abbrev: 'AE/MGA',
        people: [
          { district: '3011', name: 'PDG Ashok Kantoor', term: '2022-23' },
          { district: '3080', name: 'PDG Arun Kumar Mongia', term: '2023-24' },
          { district: '3040', name: 'PDG Col.Mahendra Mishra', term: '2021-22' },
          { district: '3053', name: 'PDG Sanjay Malviya', term: '2021-22' },
          { district: '3090', name: 'PDG Vijay Arora', term: '2020-21' },
          { district: '3142', name: 'PDG Kailash Jethani', term: '2022-23' },
        ],
      },
    ],
  },
  {
    area: 'EPNC',
    roles: [
      {
        title: 'End Polio Now Co-ordinator',
        abbrev: 'EPNC',
        people: [{ district: '3141', name: 'PDG Harjit Talwar', term: '2019-20' }],
      },
      {
        title: 'Assistant End Polio Now Co-ordinator',
        abbrev: 'AEPNC',
        people: [
          { district: '3011', name: 'PDG Sudhir Mangla', term: '2015-16' },
          { district: '3012', name: 'PDG Prashant Raj Sharma', term: '2024-25' },
          { district: '3060', name: 'PDG Santosh S Pradhan', term: '2021-22' },
          { district: '3142', name: 'AKS DP Tripathi', term: null },
          { district: '3090', name: 'PDG Rajender Taneja', term: '2000-01' },
          { district: '3056', name: 'PDG Ratnesh Kashyap', term: '2011-12' },
        ],
      },
    ],
  },
]
