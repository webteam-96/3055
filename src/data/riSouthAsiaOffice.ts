// Rotary International South Asia Office (SAO) staff directory, extracted from
// "14-Content 10. (h) onwards revised.pdf" (pages 9–11). Columns as printed:
// Name · Designation · Telephone (Direct) · E-mail. Staff are grouped by
// department; the first two entries (Regional Head + Secretarial) print with no
// department band, directly under the office information. Single source of
// truth for the /ri-south-asia-office page.

export interface RiSaoPerson {
  name: string
  designation: string
  /** Direct telephone (8-digit), as printed. */
  phone: string
  email: string
}

export interface RiSaoDept {
  /** Department band label, or null for the ungrouped leadership rows on top. */
  dept: string | null
  people: RiSaoPerson[]
}

export const RI_SAO_OFFICE = {
  address:
    'Pullman/Novotel Commercial Tower, First Floor, Asset No.2, Hospitality District, Aerocity (Near IGI Airport), New Delhi 110037',
  phones: '(91-11) 42250101 to 42250105',
  timings: '9 a.m. – 5 p.m. (Lunch timing: 1:00–1:30 pm)',
  openNote: 'Open on all days except Saturdays, Sundays & Declared Holidays',
} as const

export const RI_SAO_DEPARTMENTS: RiSaoDept[] = [
  {
    dept: null,
    people: [
      { name: 'Rajesh Anand', designation: 'Regional Head-South Asia', phone: '42250115', email: 'Rajesh.Anand@rotary.org' },
      { name: 'Abha Mathur', designation: 'Sr. Coordinator, Secretarial', phone: '42250115', email: 'Abha.Mathur@rotary.org' },
    ],
  },
  {
    dept: 'Membership Growth & Experience',
    people: [
      { name: 'Jatinder Singh', designation: 'Regional Manager of Membership Growth & Experience', phone: '42250202', email: 'Jatinder.Singh@rotary.org' },
      { name: 'Joseph Thomas', designation: 'Team Lead, Membership Growth & Experience', phone: '42250126', email: 'Joseph.Thomas@rotary.org' },
      { name: 'Daman Baweja', designation: 'Team Lead, Membership Growth & Experience', phone: '42250122', email: 'Daman.Baweja@rotary.org' },
      { name: 'Reeti Mondal', designation: 'Membership Growth Officer', phone: '42250161', email: 'Reeti.Mondal@rotary.org' },
      { name: 'Nidhita Bera', designation: 'Club Experience Officer', phone: '42250124', email: 'Nidhita.Bera@rotary.org' },
      { name: 'Himanshu Prakash', designation: 'Club Experience Officer', phone: '42250152', email: 'Himanshu.Prakash@rotary.org' },
      { name: 'Mukesh Choubey', designation: 'Club Experience Representative', phone: '42250169', email: 'Mukesh.Choubey@rotary.org' },
    ],
  },
  {
    dept: 'South Asia Philanthropy',
    people: [
      { name: 'Shakuntala Raha', designation: 'Head, South Asia Philanthropy', phone: '42250201', email: 'Shakuntala.Raha@rotary.org' },
      { name: 'Ashwini Sharma', designation: 'Team Lead - Donor Services', phone: '42250143', email: 'Ashwini.Sharma@rotary.org' },
      { name: 'Manju Joshi', designation: 'Correspondent, Donor Services', phone: '42250148', email: 'Manju.Joshi@rotary.org' },
      { name: 'Madhu Mamgain', designation: 'Assistant, Fund Development & Donor Services', phone: '42250145', email: 'Madhu.Mamgain@rotary.org' },
      { name: 'Hema Gupta', designation: 'Philanthropy Supervisor & Annual Giving Officer', phone: '42250149', email: 'Hema.Gupta@rotary.org' },
      { name: 'Akshita Juyal', designation: 'Coordinator, Annual Giving', phone: '42250159', email: 'Akshita.Juyal@rotary.org' },
      { name: 'Bhawna Verma', designation: 'Lead CSR', phone: '42250172', email: 'Bhawna.Verma@rotary.org' },
      { name: 'Moumita Deb', designation: 'Coordinator, CSR', phone: '42250163', email: 'Moumita.Deb@rotary.org' },
      { name: 'Ankita Shruti', designation: 'Coordinator, CSR', phone: '42250165', email: 'Ankita.Shruti@rotary.org' },
      { name: 'Hargun Kaur', designation: 'Coordinator, CSR', phone: '42250164', email: 'Hargun.Sodhi@rotary.org' },
      { name: 'Pratik Hiwrale', designation: 'Assistant, CSR', phone: '42250162', email: 'Pratik.Hiwrale@rotary.org' },
      { name: 'Srinija Chakraborty', designation: 'Bequest Specialist', phone: '42250253', email: 'Srinija.Chakraborty@rotary.org' },
      { name: 'Sanjay Parmar', designation: 'Senior Supervisor of Major Gifts', phone: '42250256', email: 'Sanjay.Parmar@rotary.org' },
      { name: 'Jagriti Tripathi', designation: 'Major Gifts Officer', phone: '42250252', email: 'Jagriti.Tripathi@rotary.org' },
      { name: 'Rabi David Boaz', designation: 'Major Gifts Officer', phone: '42250254', email: 'Rabi.Boaz@rotary.org' },
      { name: 'Tapojay Mukherjee', designation: 'Major Gifts Officer', phone: '42250255', email: 'Tapojay.Mukherjee@rotary.org' },
      { name: 'Lepakshi Krishan', designation: 'Major Gifts Officer', phone: '42250257', email: 'Lepakshi.Krishan@rotary.org' },
    ],
  },
  {
    dept: 'Financial Services & Grant Compliance',
    people: [
      { name: 'Ganesh Venkatakrishnan', designation: 'Head-Financial Services & Grant Compliance', phone: '42250203', email: 'Ganesh.V@rotary.org' },
      { name: 'Joby Joy', designation: 'Sr. Coordinator, Financial Services', phone: '42250132', email: 'Joby.Joy@rotary.org' },
      { name: 'Praveen Mishra', designation: 'Sr. Coordinator, Financial Services', phone: '42250134', email: 'Praveen.Mishra@rotary.org' },
      { name: 'Ruma Mondal', designation: 'Correspondent, Membership & Dues Processing', phone: '42250139', email: 'Ruma.Mondal@rotary.org' },
      { name: 'Damanjeet Kaur', designation: 'Correspondent, Financial Services', phone: '42250117', email: 'Damanjeet.Kaur@rotary.org' },
      { name: 'Akshay Baskaran', designation: 'Correspondent, Financial Services', phone: '42250135', email: 'Akshay.Baskaran@rotary.org' },
      { name: 'Aishwariya Bisht', designation: 'Correspondent, Financial Services', phone: '42250136', email: 'Aishwariya.Bisht@rotary.org' },
      { name: 'Abin John', designation: 'Assistant, Financial Services', phone: '42250138', email: 'Abin.John@rotary.org' },
      { name: 'Jitendra Patel', designation: 'Assistant, Financial Services', phone: '42250137', email: 'Jitendra.Patel@rotary.org' },
      { name: 'Riya Singh', designation: 'Assistant, Financial Services', phone: '42250133', email: 'Riya.Singh@rotary.org' },
      { name: 'Rashi Chauhan', designation: 'Assistant, Financial Services', phone: '42250131', email: 'Rashi.Chauhan@rotary.org' },
      { name: 'Roy Oommen John', designation: 'Team Lead-Rotary Grants', phone: '42250146', email: 'Roy.John@rotary.org' },
      { name: 'Sumit William', designation: 'Senior Coordinator, Rotary Grants', phone: '42250150', email: 'Sumit.William@rotary.org' },
      { name: 'Nelson Abraham', designation: 'Senior Coordinator, Rotary Grants', phone: '42250116', email: 'Nelson.Abraham@rotary.org' },
      { name: 'Sumit Sharma', designation: 'Correspondent, Rotary Grants', phone: '42250151', email: 'Sumit.Sharma@rotary.org' },
    ],
  },
  {
    dept: 'Legal & Stewardship',
    people: [
      { name: 'Tanu Malhotra', designation: 'Head- Stewardship & Legal', phone: '42250204', email: 'Tanu.Malhotra@rotary.org' },
      { name: 'Yogita Sharma', designation: 'Auditing Monitoring & District Support Specialist', phone: '42250155', email: 'Yogita.Sharma@rotary.org' },
      { name: 'Himani Kuchhal', designation: 'Auditing Monitoring & District Support Specialist', phone: '42250157', email: 'Himani.Kuchhal@rotary.org' },
    ],
  },
  {
    dept: 'Communication & Public Relation',
    people: [
      { name: 'Jyoti Rai', designation: 'Senior Communications and Public Relations Strategist', phone: '42250173', email: 'Jyoti.Rai@rotary.org' },
    ],
  },
  {
    dept: 'Global People & Talent',
    people: [
      { name: 'Shamik Mani', designation: 'Head-Global People & Talent (SAO) and Administration', phone: '42250205', email: 'Shamik.Mani@rotary.org' },
      { name: 'Ankita Awasthi', designation: 'Coordinator, Global People & Talent (SAO) & Administration', phone: '42250112', email: 'Ankita.Awasthi@rotary.org' },
      { name: 'Abhishek Saxena', designation: 'Correspondent, IT & Administration', phone: '42250113', email: 'Abhishek.Saxena@rotary.org' },
      { name: 'Shikha Chauhan', designation: 'Correspondent, Front Office', phone: '42250101', email: 'Shikha.Chauhan@rotary.org' },
      { name: 'Ramchander', designation: 'Assistant, Administration', phone: '42250114', email: 'Ramchander@rotary.org' },
    ],
  },
]
