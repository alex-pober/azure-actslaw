// pages/About.tsx
export default function About() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">About ACTS Law</h1>
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-lg text-gray-700 mb-6">
          Founded in 2010, ACTS Law Firm has been serving clients with dedication 
          and expertise for over a decade. Our team of experienced attorneys 
          specializes in various areas of law.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          To provide exceptional legal representation while building lasting 
          relationships with our clients based on trust, communication, and results.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Sarah Johnson, Partner</h3>
            <p className="text-gray-600">Specializes in Corporate Law</p>
          </div>
          <div className="border p-4 rounded">
            <h3 className="font-semibold">Michael Chen, Partner</h3>
            <p className="text-gray-600">Specializes in Real Estate Law</p>
          </div>
        </div>
      </div>
    </div>
  )
}