import { createFileRoute } from '@tanstack/react-router'
import { LeaderPage } from '../components/LeaderPage'
import portrait from '../assets/images/leader/leader-sample-babalola.jpg'

export const Route = createFileRoute('/leader-preview')({
  component: LeaderPreviewPage,
})

// Sample content lifted from Finalised Page.pdf so we can diff the rendered
// page against the reference design.
const SAMPLE_BODY = `Olayinka Hakeem Babalola, a member of the Rotary Club of Trans Amadi, Nigeria, has been selected by the Board of Directors to become Rotary International's president for 2026-27. His term will begin on 1 July 2026.

The Board, guided by the RI code of policies, conducted a special session to select the organization's leader after the resignation of RI President-elect SangKoo Yun, who decided to step back from his Rotary responsibilities and focus on his recovery from recent cancer treatment.

Babalola began his Rotary journey in 1984 as a Rotaractor. He joined the Rotary Club of Trans Amadi 10 years later. His leadership roles include serving as district governor (2011-12), RI vice president (2019-20), and member of the RI Board (2018-20). He was also an active leader and participant in RI committees such as the End Polio Now Countdown to History Campaign Committee (2017-23) and the Nigeria National PolioPlus Committee (2013-present, adviser 2016-present).`

function LeaderPreviewPage() {
  return (
    <div style={{ background: '#e9eaee', padding: '24px 0', minHeight: '100vh' }}>
      <LeaderPage
        kind="profile"
        name="Olayinka Hakeem Babalola"
        designation="Rotary International President"
        year="2026-27"
        photo={portrait}
        body={SAMPLE_BODY}
      />
    </div>
  )
}
