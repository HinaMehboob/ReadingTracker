import { useState, useEffect } from "react";
import { FiBook, FiGrid, FiPieChart, FiFileText, FiLogOut, FiCompass } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  userName?: string | null;
}

const navItems = [
  { label: 'Library', id: 'library', path: '/', icon: <FiBook /> },
  { label: 'Collections', id: 'collections', path: '/', icon: <FiGrid /> },
  { label: 'Analytics', id: 'analytics', path: '/', icon: <FiPieChart /> },
  { label: 'Notes', id: 'notes', path: '/', icon: <FiFileText /> },
  { label: 'Explore', id: 'explore', path: '/explore', icon: <FiCompass /> },
];

export default function Sidebar({ userName }: SidebarProps) {
  const [activeSection, setActiveSection] = useState('library');
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== '/') {
      if (pathname === '/explore') setActiveSection('explore');
      return;
    }

    const handleScroll = () => {
      let currentId = 'library';
      
      for (const item of navItems) {
        if (item.path !== '/') continue;
        const section = document.getElementById(item.id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 200) {
            currentId = item.id;
          }
        }
      }
      
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
        currentId = 'notes';
      }

      setActiveSection(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const handleNavClick = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    if (item.path === '/explore') {
      router.push('/explore');
      return;
    }

    // Attempting to scroll on same page
    if (pathname === '/') {
      const element = document.getElementById(item.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(item.id);
      }
    } else {
      router.push(`/#${item.id}`);
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
            <a
              key={item.id}
              href={item.path === '/explore' ? '/explore' : `/#${item.id}`}
              onClick={(e) => handleNavClick(e, item)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-300 border ${
                isActive 
                  ? 'bg-[#1e1e1e] text-[#f5f5f5] font-semibold border-[#2d2d2d] shadow-sm' 
                  : 'bg-transparent text-[#737373] opacity-60 font-medium border-transparent hover:opacity-100 hover:bg-[#1a1a1a]'
              }`}
            >
              <span className={isActive ? "text-[#10b981]" : "opacity-70"}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
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
