import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => (
    <div className="p-8 text-center text-[#3b251a]">
      <h1 className="text-3xl font-bold mb-4">Rotary District 3170</h1>
      <p>Digital Directory — Homepage coming soon</p>
    </div>
  ),
})
