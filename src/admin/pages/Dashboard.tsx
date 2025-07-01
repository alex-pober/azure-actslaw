// admin/pages/Dashboard.tsx
export default function Dashboard() {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Active Cases</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">Total Clients</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">156</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700">This Month</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">$45K</p>
          </div>
        </div>
      </div>
    )
  }