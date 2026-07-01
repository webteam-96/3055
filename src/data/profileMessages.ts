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
import babalola from '../assets/images/leader/leader-sample-babalola.jpg'
import shyamKumar from '../assets/images/leader/leader-shyam-kumar.jpg'
import aneriBhatt from '../assets/images/leader/leader-aneri-bhatt.jpg'
import geetikaSaluja from '../assets/images/leader/leader-geetika-saluja.jpg'
import varshaShah from '../assets/images/leader/leader-varsha-shah.jpg'

export interface Person {
  name: string
  designation: string
  /** Rotary year/term, e.g. "2026-27". Optional. */
  year?: string
  photo: string
  profile?: string
  message?: string
}

export const PEOPLE: Person[] = [
  {
    name: 'Olayinka Hakeem Babalola',
    designation: 'Rotary International President',
    year: '2026-27',
    photo: babalola,
    profile: `Olayinka Hakeem Babalola, a member of the Rotary Club of Trans Amadi, Nigeria, has been selected by the Board of Directors to become Rotary International's president for 2026-27. His term will begin on 1 July 2026.

The Board, guided by the RI code of policies, conducted a special session to select the organization's leader after the resignation of RI President-elect SangKoo Yun, who decided to step back from his Rotary responsibilities and focus on his recovery from recent cancer treatment.

Babalola began his Rotary journey in 1984 as a Rotaractor. He joined the Rotary Club of Trans Amadi 10 years later. His leadership roles include serving as district governor (2011-12), RI vice president (2019-20), and member of the RI Board (2018-20). He was also an active leader and participant in RI committees such as the End Polio Now Countdown to History Campaign Committee (2017-23) and the Nigeria National PolioPlus Committee (2013-present, adviser 2016-present).`,
  },
  {
    name: 'Naimish N. Ravani',
    designation: 'District Governor',
    year: '2026-27',
    photo: '', // TODO: DG portrait not in the docx — add a clean photo when shared.
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
    designation: 'District Governor Elect',
    year: '2026-27',
    photo: shyamKumar,
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
    designation: 'Unicorn District Rotaract Representative',
    year: '2026-27',
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
    designation: 'District Governor Nominee',
    year: '2028-29',
    photo: '', // TODO: DGND portrait not in the docx — add a clean photo when shared.
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
    name: 'Rtn. Dr. Geetika Saluja',
    designation: 'Chairperson — District Directory Committee',
    year: '2026-27',
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
    designation: 'District Chairman — Inner Wheel District 305',
    year: '2026-27',
    photo: varshaShah,
    profile: `Born and raised in the heritage city of Ahmedabad, where the first Inner Wheel Club of our country was established, Varsha Shah's life is deeply rooted in the values of culture, service, and resilience. She holds a degree in Commerce and is married to Bhavesh Shah, a renowned businessman. Their elder daughter Urvija is married to Rahul Shah, who runs a successful software company; and their younger son Chiranjiv has completed his studies and joined the family business. Varsha's greatest joy is her little grandson, Nemiraj.

Her spirit has always been creative and curious. Having learned Indian Classical Vocal Music and earned a Bachelor degree "Visharad", she later discovered a new hobby—nature photography. Her love for nature turned into a passion for bird photography, leading her to explore many national parks and capture the beauty of the wild. Her photographs speak of patience and the poetry of life.

Her journey of service began in 2008, when she became the President of Lioness Club of Naranpura. She earned the Best President and "Child Welfare" awards for her outstanding dedication and work for the community.

Her heart has always been drawn to education—she volunteered with Samvedna, helping underprivileged children find hope through learning. To strengthen her impact, she completed a correspondence course in "Teaching Techniques" from the University of London, reflecting her belief that growth begins with knowledge.

In 2013, she joined the Inner Wheel Club of Ahmedabad South, following in the inspiring footsteps of her aunt, who had also served as President. Her leadership brought life to many meaningful projects:
• Supporting a school for children who study on the footpath
• Helping blind girls become entrepreneurs
• Providing 100 shelter umbrellas for traffic policemen who stand tirelessly under the sun and rain across the city

In the year 2020–21, she became the President of her club. During her tenure, the club received eight District Awards, including:
• Best President
• Manorama Kansal Award
• Sudha Gerg Memorial Award
• Swarna Rachna Jalnidhi Award
• Environmental & Childcare Award

Her journey within Inner Wheel has been one of steady growth and grace. She has proudly served as:
• District ISO (2022) — under her guidance, her club successfully hosted the District Conference "Hosala" at Ahmedabad, and with her encouragement and support, the club donated 14 pink autorickshaws to 14 needy women.
• District Editor (2023)
• District Secretary (2024)
• District Vice Chairman (2025)

Her dedication has taken her across many platforms—from Triennial Conferences and Virtual International Conventions to National and District-level meetings, always carrying with her the light of friendship and the strength of purpose.

Beyond Inner Wheel, she continues to serve society with the same compassion. She volunteers with the Karunakare Foundation to support underprivileged children, is a member of the Executive Committee of FICCI FLO, and an active part of the Femina Club, one of the largest women's groups in Ahmedabad.

Guided by the wisdom of her mentors, inspired by the strength of women around her, and anchored in her belief that small acts of kindness can bring great change, she continues to live her life as a symbol of love, leadership, and light—creating not just projects, but possibilities; not just achievements, but inspiration.`,
  },
]
