import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage, RefHeading } from '../components/ReferencePage'

export const Route = createFileRoute('/club-excellence-award')({
  component: ClubExcellenceAwardPage,
})

/** RI President's Club Excellence Award (source: Directory-2025-26.pdf, page 222). */
export function ClubExcellenceAwardPage() {
  return (
    <ReferenceDoc title="RI President's Club Excellence Award">
      <ReferencePage pageIndex={0} title="RI PRESIDENT'S CLUB EXCELLENCE AWARD" density={0.92} contentClassName="cea">
        <RefHeading>Goals and Instruction :</RefHeading>
        <p>
          The Rotary Citation, which has been renamed as the Club Excellence Award starting 1 July 2024, recognizes the
          hard work Clubs do throughout the year. Taking action toward achieving the required number of goals helps Clubs
          engage their members, stay relevant in their communities, and run more efficiently. A welcoming and engaging
          Club also reflects the values of Rotary. When Clubs work to achieve these goals, they also contribute to the
          overall health and culture of Rotary for generations to come.
        </p>
        <p>
          To be eligible for the Club Excellence Award, Clubs need to be active and in good standing-or have paid each
          invoice balance in full upon receipt. To verify that your Club is in good standing, go to My Rotary&gt; Click on
          Club Name&gt;Finance&gt;Club Invoice. You should have an outstanding balance of $0.00. Invoices are due when they
          are posted, in mid-January and mid-July.
        </p>
        <p>
          Rotary Club leaders can go into Rotary Club Central and select the goals they wish to apply toward the club's
          excellence achievement. This flexibility allows clubs to choose the goals that are most relevant and
          achievable. In addition, many goals will be self-reported by marking "achieved" in Rotary Club Central. Clubs
          must achieve at least half of the goals by 30 June to be eligible.
        </p>

        <RefHeading>To achieve the Club Excellence Award :</RefHeading>
        <ol className="ref-ol">
          <li>Go to Rotary Club Central</li>
          <li>Review the available goals</li>
          <li>Set at least half of the available goals</li>
          <li>Achieve those goals</li>
          <li>Report achievement in Rotary Club Central by 30 June.</li>
          <li>Pay club invoices in full upon receipt</li>
        </ol>
        <p>
          Once you are in Rotary Club Central, go to Club Goals on the left side of the page if you are not there already,
          select the year, and click on the All tab to see the goals. Eligibility will be determined based on goal
          achievement as of 30 June.
        </p>
      </ReferencePage>
    </ReferenceDoc>
  )
}
