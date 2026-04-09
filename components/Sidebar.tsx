import { useState, useEffect } from "react";
import { FiBook, FiGrid, FiPieChart, FiFileText, FiLogOut } from "react-icons/fi";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userName?: string | null;
}

const navItems = [
  { label: 'Library', id: 'library', icon: <FiBook /> },
  { label: 'Collections', id: 'collections', icon: <FiGrid /> },
  { label: 'Analytics', id: 'analytics', icon: <FiPieChart /> },
  { label: 'Notes', id: 'notes', icon: <FiFileText /> },
];

export default function Sidebar({ userName }: SidebarProps) {
  const [activeSection, setActiveSection] = useState('library');

  useEffect(() => {
    const handleScroll = () => {
      let currentId = 'library';
      
      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          // Adjust threshold to detect which section is currently taking up the screen
          if (rect.top <= 200) {
            currentId = item.id;
          }
        }
      }
      
      // Also check if we scrolled to the very bottom
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        currentId = 'notes'; // The last section
      }

      setActiveSection(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initialize on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id); // Optimistically set
    }
  };

  return (
    <div className="w-64 fixed top-0 left-0 h-screen bg-[#141414] border-r border-[#2d2d2d] flex flex-col pt-8 pb-6 text-[#a3a3a3]">
      <div className="px-6 mb-10 flex flex-col space-y-1">
        <h1 className="text-sm font-semibold tracking-tight text-[#e5e5e5]">Reading Tracker</h1>
        {userName && <div className="text-xs text-[#a3a3a3]">{userName}</div>}
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 border ${
                isActive 
                  ? 'bg-[#1e1e1e] text-[#f5f5f5] font-semibold border-[#2d2d2d] shadow-sm' 
                  : 'bg-transparent text-[#737373] opacity-60 font-medium border-transparent hover:opacity-100 hover:bg-[#1a1a1a]'
              }`}
            >
              <span className={isActive ? "text-[#10b981]" : "opacity-70"}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium opacity-60 hover:opacity-100 hover:bg-[#1a1a1a] transition-colors text-[#737373]"
        >
          <span className="opacity-70"><FiLogOut /></span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
