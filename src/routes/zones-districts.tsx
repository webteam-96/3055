import { createFileRoute } from '@tanstack/react-router'
import { ReferenceDoc, ReferencePage } from '../components/ReferencePage'
import zonesMap from '../assets/images/reference/zones-districts-map.png'

export const Route = createFileRoute('/zones-districts')({
  component: ZonesDistrictsPage,
})

/** Rotary Zones & Districts map (source: Directory-2025-26.pdf, page 8). */
export function ZonesDistrictsPage() {
  return (
    <ReferenceDoc title="Rotary Zones & Districts">
      <ReferencePage pageIndex={0} title="ROTARY ZONES & DISTRICTS" contentClassName="zones">
        <figure className="ref-figure zones-figure">
          <img src={zonesMap} alt="Rotary Zones & Districts — India map, Zone 4 with District 3055 area" />
        </figure>
      </ReferencePage>
    </ReferenceDoc>
  )
}
