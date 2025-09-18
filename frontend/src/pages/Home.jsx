import { useState } from 'react'

const Home = () => {
  const [stats] = useState([
    { title: 'Total Users', value: '12,458', icon: 'fas fa-users', color: 'text-primary', change: '+12%' },
    { title: 'Messages', value: '2,345', icon: 'fas fa-comment', color: 'text-secondary', change: '+8%' },
    { title: 'Revenue', value: '$24,458', icon: 'fas fa-chart-line', color: 'text-purple-600', change: '-3%' }
  ])

  return (
    <div>
      <header className="bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold">Home</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-bell text-gray-600"></i>
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
              </button>
            </div>
            <div className="relative">
              <button className="p-2 rounded-full hover:bg-gray-100">
                <i className="fas fa-envelope text-gray-600"></i>
                <span className="absolute top-0 right-0 h-4 w-4 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">5</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color.replace('text', 'bg')} bg-opacity-20`}>
                  <i className={`${stat.icon} ${stat.color} text-xl`}></i>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold">{stat.title}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className={`${stat.change.includes('+') ? 'text-green-600' : 'text-red-600'} text-sm`}>
                  <i className={`fas fa-arrow-${stat.change.includes('+') ? 'up' : 'down'}`}></i> 
                  {stat.change} since last month
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <ul className="divide-y">
              <li className="py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                    <i className="fas fa-user-plus"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">New user registered</p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-secondary flex items-center justify-center">
                    <i className="fas fa-comment"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">New message received</p>
                    <p className="text-xs text-gray-500">15 minutes ago</p>
                  </div>
                </div>
              </li>
              <li className="py-3">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">Sales report generated</p>
                    <p className="text-xs text-gray-500">1 hour ago</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <a href="#" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100">
                <i className="fas fa-user-plus text-primary text-2xl mb-2"></i>
                <p className="text-sm font-medium">Add User</p>
              </a>
              <a href="#" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100">
                <i className="fas fa-comment text-secondary text-2xl mb-2"></i>
                <p className="text-sm font-medium">New Message</p>
              </a>
              <a href="#" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100">
                <i className="fas fa-chart-pie text-purple-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium">Reports</p>
              </a>
              <a href="#" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100">
                <i className="fas fa-cog text-yellow-600 text-2xl mb-2"></i>
                <p className="text-sm font-medium">Settings</p>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home