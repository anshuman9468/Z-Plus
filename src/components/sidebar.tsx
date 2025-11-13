import { motion } from 'motion/react';
import { LayoutDashboard, Upload, History, ShieldCheck, Settings, LogOut, TrendingUp } from 'lucide-react';

type Page = 'landing' | 'dashboard' | 'progress' | 'results' | 'history' | 'insights' | 'verifier';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', page: 'dashboard' as Page },
    { icon: Upload, label: 'Upload', page: 'dashboard' as Page },
    { icon: History, label: 'History', page: 'history' as Page },
    { icon: TrendingUp, label: 'Data Model Insights', page: 'insights' as Page },
    { icon: ShieldCheck, label: 'ZK Verifier', page: 'verifier' as Page },
    { icon: Settings, label: 'Settings', page: 'dashboard' as Page },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-cyan-400/20 h-screen sticky top-0 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-cyan-400/20">
        <motion.div
          className="text-3xl bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
          whileHover={{ scale: 1.05 }}
        >
          Z+
        </motion.div>
        <p className="text-xs text-gray-500 mt-1">Verifiable AI Platform</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                currentPage === item.page
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-400/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-cyan-400/20">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-800/50 transition-all">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}