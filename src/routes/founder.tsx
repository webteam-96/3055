import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import portrait from '../assets/images/reference/paul-harris.png'

export const Route = createFileRoute('/founder')({
  component: FounderPage,
})

/** Founder of Rotary — Paul P. Harris (source: Directory-2025-26.pdf, page 5). */
export function FounderPage() {
  return (
    <ReferenceDoc title="Founder of Rotary — Paul P. Harris">
      <ReferencePage pageIndex={0} title="FOUNDER OF ROTARY" contentClassName="founder" noPaginate>
        <div className="founder-name">PAUL P. HARRIS</div>

        <figure className="ref-figure">
          <img className="ref-portrait" src={portrait} alt="Paul P. Harris" />
        </figure>

        <p className="ref-quote">
          “The foundation upon which Rotary is built is friendship;
          <br />
          On no less firm foundation could it have stood.”
        </p>

        <p>
          <strong>Paul P. Harris</strong> (1868-1947), an attorney, was the founder of Rotary, the world's first and
          foremost International service organization. From Chicago city-its's birthplace, Rotary has reached to hundreds
          of cities of more then 200 countries of the world in last 120 years.
        </p>
        <p>
          An organization of business and professional leaders, Rotary unites people for humanitarian service promoting
          high ethical standards and helps build goodwill and peace in the world with motto of{' '}
          <strong>“Service Above Self”.</strong>
        </p>
      </ReferencePage>
    </ReferenceDoc>
  )
}
