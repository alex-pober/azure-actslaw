export default function Home() {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to ACTS Law Firm
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Providing exceptional legal services with integrity, expertise, and dedication. 
            Your trusted partner in navigating complex legal matters.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">⚖️ Corporate Law</h3>
              <p className="text-gray-600">Expert guidance for business legal matters</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">🏠 Real Estate</h3>
              <p className="text-gray-600">Complete property transaction support</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-3">👨‍👩‍👧‍👦 Family Law</h3>
              <p className="text-gray-600">Compassionate family legal services</p>
            </div>
          </div>
        </div>
      </div>
    )
  }