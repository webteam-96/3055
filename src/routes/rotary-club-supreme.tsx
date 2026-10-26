import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage, RefHeading } from '../components/ReferencePage'

export const Route = createFileRoute('/rotary-club-supreme')({
  component: RotaryClubSupremePage,
})

/**
 * Rotary Club of Ahmedabad Supreme — a static club profile, same framed-B5
 * reference-sheet design (Border frame + Petrona type, black body copy) as the
 * other static pages; the content flows across sheets via ReferencePage's built-in
 * pagination. Text reproduced verbatim from the club write-up supplied for the
 * directory.
 */
export function RotaryClubSupremePage() {
  return (
    <ReferenceDoc title="Rotary Club of Ahmedabad Supreme" pdfName="Rotary Club of Ahmedabad Supreme — Rotary District 3055">
      <ReferencePage pageIndex={0} title="ROTARY CLUB OF AHMEDABAD SUPREME" contentClassName="club" fill={0.99}>
        <p className="ref-lead" style={{ textAlign: 'center' }}>
          A Legacy of Service, Growth &amp; Impact
        </p>
        <p>
          Established in 2010 with just 20–25 members, Rotary Club of Ahmedabad Supreme has grown into a 160+ member club
          and a prominent force for service in Ahmedabad. Over the years, Supreme has built a strong legacy of service,
          fellowship, leadership, membership growth and commitment to The Rotary Foundation, with projects focused on
          creating lasting impact.
        </p>
        <p>
          Healthcare remains a key focus of the club. Drashti – Eye OT on Wheel, a flagship Global Grant project, takes
          critical eye-care services and surgeries to rural and underserved communities. The club also works closely
          with the Blind People’s Association and regularly conducts Cancer Detection and Blood Donation Camps, including
          large-scale Inter-District Blood Donation drives in partnership with corporates such as Deloitte.
        </p>
        <p>
          Through its Resilient Village initiatives in Undrel, Shahpur and Raska, the club addresses community needs
          through cybersecurity literacy, CPR training and mental-health awareness. Van Kavach, its Miyawaki forest
          initiative, combines environmental sustainability with village skill-development centres and Peace Kutirs.
        </p>
        <p>
          The Dada Dadi Project, running continuously for nearly 15 years, provides grocery kits and hygiene essentials,
          along with medical support every quarter, to vulnerable elderly people, mothers and Anganwadi children.
        </p>
        <p>
          Supreme Jal Seva is another initiative that has evolved into a city-wide movement. What began with community
          water coolers has grown into Supreme Jal Seva 2.0, with upgraded RO purification and chilling facilities in
          South Bopal and Vastrapur, capable of providing up to 20,000 litres of clean drinking water daily to students,
          commuters and the community.
        </p>
        <p>
          Supreme boasts the highest number of Major Donors in Rotary District 3055, with 14 Major Donors, including four
          Major Donors at Level 3. This remarkable achievement reflects the club’s strong commitment to The Rotary
          Foundation and its culture of giving.
        </p>
        <p>
          The club’s growing membership, financial strength and community footprint have established it as a premier
          “Mega Club” of District 3055, while continuing to nurture Rotary leaders at both club and district levels.
        </p>

        <RefHeading rule={false}>Leadership – Rotary Year 2026–27</RefHeading>
        <ul className="ref-ul">
          <li>
            <b>President:</b> Rtn. Dilip Nair
          </li>
          <li>
            <b>Secretary:</b> Rtn. Vivek Handa
          </li>
        </ul>
      </ReferencePage>
    </ReferenceDoc>
  )
}
