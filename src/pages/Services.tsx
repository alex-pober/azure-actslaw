// pages/Services.tsx
export default function Services() {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Services</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">⚖️ Corporate Law</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Business formation and structure</li>
              <li>• Contract drafting and review</li>
              <li>• Mergers and acquisitions</li>
              <li>• Corporate governance</li>
            </ul>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">🏠 Real Estate Law</h2>
            <ul className="space-y-2 text-gray-600">
              <li>• Property purchases and sales</li>
              <li>• Title examinations</li>
              <li>• Zoning and land use</li>
              <li>• Landlord-tenant disputes</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }