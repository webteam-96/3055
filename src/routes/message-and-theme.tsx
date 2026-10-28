import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage, RefHeading } from '../components/ReferencePage'
import cliLogo from '../assets/images/theme/create-lasting-impact.png'
import nirmanLogo from '../assets/images/theme/team-nirman.jpg'

export const Route = createFileRoute('/message-and-theme')({
  component: MessageAndThemePage,
})

/**
 * Message and Theme — two distinct sections, the RI Presidential Message FIRST and
 * the District Theme (NIRMAN) SECOND, each its own framed-B5 section with its own
 * banner + logo, flowing across sheets via ReferencePage's built-in pagination.
 * Same reference-sheet design (Border frame + Petrona type) as the other static
 * pages. Text is reproduced verbatim from the content supplied for the directory.
 *
 * The two sections are extracted as standalone sheet components so the master
 * "Download Everything" export can render them as TWO separate recto documents
 * (see {@link PresidentialMessagePage} / {@link NirmanThemePage}) — that forces the
 * NIRMAN theme to open on a right-hand (recto) page, with a full-page ad filling
 * the left-hand page before it. The live /message-and-theme route still shows both
 * sections under one chrome via {@link MessageAndThemePage}.
 */

/** Section 1 — the RI Presidential Message sheet (one framed B5 sheet). */
export function PresidentialMessageSheet() {
  return (
    <ReferencePage pageIndex={0} title="2026-27 RI PRESIDENTIAL MESSAGE" contentClassName="mt">
      <div className="mt-logo mt-logo--sq">
        <img src={cliLogo} alt="Create Lasting Impact" />
      </div>
      <p>
        The annual presidential message offers us a powerful tool to share compelling Rotary stories in a consistent
        way. By using a message that aligns with our Action Plan, we can also inspire others to take action with us.
      </p>
      <p>
        Our 2026-27 message, Create Lasting Impact, encourages all of us, as people of action, to work together to
        make a meaningful difference in our communities and around the world. It builds on the ways in which members
        have strengthened their connections to each other and to their communities to Unite for Good, the 2025-26
        message. Now, Create Lasting Impact will harness those connections and inspire our members, participants, and
        the public to take collective actions that lead to a sustainable difference — globally, locally, and
        personally.
      </p>
      <p>
        To show the world how members are creating lasting change through Rotary, you can collect information and
        share stories that demonstrate the impact your club makes through service projects and other work in the
        community. Another great way to do this is by sharing videos from the series “Personal Perspectives: The Value
        of Rotary.” These short testimonials highlight how Rotary creates positive change around the world and in the
        lives of our members.
      </p>
    </ReferencePage>
  )
}

/** Section 2 — the District Theme (NIRMAN) sheets.
 *  fill=0.99 packs each sheet closer to the bottom margin so the content uses the
 *  space and doesn't spill a lone paragraph onto an extra page. */
export function NirmanThemeSheet() {
  return (
    <ReferencePage pageIndex={0} title="NIRMAN – THE FOURTH THEME OF ROTARY DISTRICT 3055" contentClassName="mt" fill={0.99}>
      <div className="mt-logo mt-logo--wide">
        <img src={nirmanLogo} alt="Team NIRMAN — Impactful Service, Building Futures" />
      </div>
      <p className="ref-lead" style={{ textAlign: 'center' }}>
        Impactful Service. Building Futures.
      </p>
      <p>Every Rotary year delivers projects. Some create a legacy.</p>
      <p>
        NIRMAN is more than a district theme—it is a vision to build people, partnerships, communities and
        possibilities. Under the leadership of District Governor Rtn. Naimish Ravani, Rotary District 3055 is
        committed to taking the district one step forward by transforming good service into meaningful, measurable and
        sustainable impact.
      </p>

      <RefHeading rule={false}>The Logo – A Story in Every Element</RefHeading>
      <p>The logo is a powerful expression of unity, purpose and progress.</p>
      <p>At its heart are four human figures, symbolising the core values that define Rotary:</p>
      <ul className="ref-ul">
        <li>
          <b>Service</b> – Serving with compassion.
        </li>
        <li>
          <b>Leadership</b> – Inspiring change through action.
        </li>
        <li>
          <b>Fellowship</b> – Growing stronger together.
        </li>
        <li>
          <b>Integrity</b> – Building trust through ethical conduct.
        </li>
      </ul>
      <p>
        Together, these figures form a single structure, reminding us that lasting change is created when individuals
        unite with a common purpose.
      </p>
      <p>
        Above them rises a flame, symbolising hope, enlightenment and purpose. It signifies that every act of service
        lights another life and creates a ripple effect that extends far beyond today.
      </p>
      <p>
        The circular design reflects collaboration, continuity and inclusiveness. It represents Rotary's strength in
        bringing together clubs, communities, partners and generations to build a stronger future.
      </p>

      <RefHeading rule={false}>The Colours of NIRMAN</RefHeading>
      <ul className="ref-ul">
        <li>
          <b>Blue</b> represents trust, integrity and Rotary leadership.
        </li>
        <li>
          <b>Green</b> signifies growth, sustainability and a better tomorrow.
        </li>
        <li>
          <b>Orange</b> reflects energy, hope and purposeful action.
        </li>
      </ul>
      <p>
        The multicoloured "N" beautifully blends these colours, symbolising the convergence of diverse ideas, talents
        and people into one unified mission. It reminds us that every Rotarian brings unique strengths, and together
        we create Impactful Service, Building Futures.
      </p>

      <RefHeading rule={false}>The Vision</RefHeading>
      <p>
        NIRMAN is a call to move beyond completing projects to creating lasting transformation. It encourages every
        Rotarian to build leaders of character, empowered communities, sustainable initiatives and opportunities that
        endure for generations.
      </p>
      <p>
        As Rotary International inspires us to Create Lasting Impact, District 3055 embraces NIRMAN as its pathway to
        that vision—where every project becomes a foundation stone, every member becomes a builder, and every act of
        service shapes a brighter future.
      </p>
      <p>
        NIRMAN is not merely about constructing projects. It is about constructing hope, opportunities, relationships
        and a legacy that will stand the test of time.
      </p>
    </ReferencePage>
  )
}

/** Live /message-and-theme route: both sections under one chrome / one PDF. */
export function MessageAndThemePage() {
  return (
    <ReferenceDoc title="Message and Theme" pdfName="Message and Theme — Rotary District 3055">
      <PresidentialMessageSheet />
      <NirmanThemeSheet />
    </ReferenceDoc>
  )
}

/** Master-export document: the RI Presidential Message alone (recto). */
export function PresidentialMessagePage() {
  return (
    <ReferenceDoc title="RI Presidential Message" pdfName="RI Presidential Message — Rotary District 3055">
      <PresidentialMessageSheet />
    </ReferenceDoc>
  )
}

/** Master-export document: the District Theme (NIRMAN) alone (recto) — so it opens
 *  on a right-hand page, with a full-page ad on the facing left page. */
export function NirmanThemePage() {
  return (
    <ReferenceDoc title="District Theme — NIRMAN" pdfName="District Theme NIRMAN — Rotary District 3055">
      <NirmanThemeSheet />
    </ReferenceDoc>
  )
}
