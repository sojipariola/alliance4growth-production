import { 
  FaHome, 
  FaUsers, 
  FaCalendarAlt, 
  FaChartBar,
  FaHistory,
  FaImage,
  FaHeart,
  FaUniversity
} from 'react-icons/fa';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FaHome },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'events', label: 'Upcoming Events', icon: FaCalendarAlt },
    { id: 'pastevents', label: 'Past Events', icon: FaHistory },
    { id: 'heroimages', label: 'Hero Images', icon: FaImage },
    { id: 'donations', label: 'Donations', icon: FaHeart },
    { id: 'banktransfers', label: 'Bank Transfers', icon: FaUniversity },
    { id: 'stats', label: 'Statistics', icon: FaChartBar },
  ];

  return (
    <div className="w-64 bg-primary text-white min-h-screen sticky top-0">
      <div className="p-6 border-b border-white border-opacity-20">
        <h2 className="text-2xl font-heading font-bold">Admin Panel</h2>
        <p className="text-sm opacity-75 mt-1">A4G Forth Valley</p>
      </div>
      
      <nav className="mt-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors ${
                isActive
                  ? 'bg-white bg-opacity-20 border-r-4 border-accent'
                  : 'hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Icon className={`text-lg ${isActive ? 'text-accent' : ''}`} />
              <span className={isActive ? 'font-semibold' : ''}>{tab.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-white border-opacity-20">
        <div className="text-xs opacity-60">
          <p>© 2024 A4G Forth Valley</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
