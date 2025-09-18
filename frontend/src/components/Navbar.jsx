import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-md">
      
      {/* Left */}
      <div>
        <Link
          to="/"
          className="text-white hover:text-blue-400 font-bold text-lg transition-colors duration-200"
        >
          Home
        </Link>
      </div>

      {/* Center */}
      <div>
        <Link
          to="/chat"
          className="text-white hover:text-green-400 font-bold text-lg transition-colors duration-200"
        >
          Chat
        </Link>
      </div>

      {/* Right */}
      <div>
        <Link
          to="/dashboard"
          className="text-white hover:text-yellow-400 font-bold text-lg transition-colors duration-200"
        >
          Dashboard
        </Link>
      </div>
    </nav>
  );
}
