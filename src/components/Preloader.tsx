interface PreloaderProps {
  isLoading: boolean
}

export function Preloader({ isLoading }: PreloaderProps) {
  if (!isLoading) return null
  return (
    <div className="preloader">
      <div className="boxes">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="box">
            <div /><div /><div /><div />
          </div>
        ))}
      </div>
    </div>
  )
}
