export function Footer() {
  return (
    <footer className="bg-[#111] py-4 text-center text-sm text-gray-400">
      <div className="auto-container">
        <p>
          &copy; {new Date().getFullYear()} Developed and maintained by{' '}
          <a
            href="https://kaizeninfotech.com/"
            target="_blank"
            rel="noreferrer"
            className="text-[#E59E2C] hover:underline"
          >
            Kaizen Infotech Solutions Pvt. Ltd.
          </a>
        </p>
      </div>
    </footer>
  )
}
