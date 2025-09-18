const Dashboard = () => {
  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Dashboard Overview</h3>
          <p className="text-gray-600">
            This is your dashboard where you can see an overview of your application data and metrics.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">Revenue chart would be displayed here</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <p className="text-gray-500">User growth chart would be displayed here</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard