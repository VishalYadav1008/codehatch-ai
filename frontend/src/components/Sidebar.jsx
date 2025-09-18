import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation()
  const [activeItem, setActiveItem] = useState(location.pathname)

  const handleItemClick = (path) => {
    setActiveItem(path)
  }

  const menuItems = [
    { path: '/', icon: 'fas fa-home', label: 'Home' },
    { path: '/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { path: '/chat', icon: 'fas fa-comment', label: 'Chat' },
  ]

  const secondaryItems = [
    { path: '/settings', icon: 'fas fa-cog', label: 'Settings' },
    { path: '/help', icon: 'fas fa-question-circle', label: 'Help' },
    { path: '/logout', icon: 'fas fa-sign-out-alt', label: 'Logout' },
  ]

  return (
    <div className={`sidebar-transition bg-dark text-white ${isOpen ? 'w-64' : 'w-20'} fixed h-full overflow-y-auto`}>
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-2xl font-bold flex items-center">
          <i className="fas fa-rocket mr-3"></i>
          {isOpen && <span>AdminPanel</span>}
        </h1>
      </div>
      
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-4 p-2">
          <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-xl font-bold">JD</span>
          </div>
          {isOpen && (
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <p className="text-gray-400 text-sm">Admin</p>
            </div>
          )}
        </div>
      </div>
      
      <nav className="p-4">
        <div className="mb-6">
          {isOpen && <h3 className="text-gray-400 uppercase text-xs font-bold mb-3">Main</h3>}
          <ul>
            {menuItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg ${activeItem === item.path ? 'active-tab' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleItemClick(item.path)}
                >
                  <i className={`${item.icon} ${isOpen ? 'mr-3' : 'mx-auto'}`}></i>
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mb-6">
          {isOpen && <h3 className="text-gray-400 uppercase text-xs font-bold mb-3">Resources</h3>}
          <ul>
            {secondaryItems.map((item) => (
              <li key={item.path} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg ${activeItem === item.path ? 'active-tab' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleItemClick(item.path)}
                >
                  <i className={`${item.icon} ${isOpen ? 'mr-3' : 'mx-auto'}`}></i>
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button 
          onClick={toggleSidebar}
          className="flex items-center p-2 rounded-lg text-gray-300 hover:bg-gray-800 w-full"
        >
          <i className={`fas fa-chevron-left ${isOpen ? 'mr-3' : 'mx-auto'} ${!isOpen && 'rotate-180'}`}></i>
          {isOpen && <span>Collapse Sidebar</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar