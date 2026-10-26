import rotaryLogo from '../assets/images/rotary-placeholder.png'
import './NoPhoto.css'

/**
 * The "no photograph" placeholder used across the whole Digital Directory: the Rotary
 * International wheel, shown WHEREVER a member / officer / spouse photo is missing. It
 * absolutely fills its (position:relative) photo box and is CONTAINED, so the round mark is
 * never cropped; when a real photo loads it layers on top (object-fit:cover) and hides this.
 * Replaces the old grey person-silhouette SVG (and, via `rotaryLogo`, the dummy.jpg fallback
 * on the MemberCard / LeaderPage photos).
 */
export function NoPhoto({ className = '' }: { className?: string }) {
  return <img src={rotaryLogo} alt="" aria-hidden="true" className={`no-photo-logo ${className}`.trim()} />
}

export { rotaryLogo }
