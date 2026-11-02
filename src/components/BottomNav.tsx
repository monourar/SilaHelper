import React from 'react';
import { Home, BookOpen, BarChart3, Settings } from 'lucide-react';

export type NavTab = 'home' | 'library' | 'budget' | 'settings';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'الرئيسية', icon: Home },
    { id: 'library' as NavTab, label: 'مكتبتي', icon: BookOpen },
    { id: 'budget' as NavTab, label: 'الميزانية', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav 
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto px-4 pb-[max(env(safe-area-inset-bottom),12px)] pt-1"
    >
      <div className="bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[28px] shadow-sm px-3 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[48px] rounded-2xl transition-[color,transform] duration-150 ease-out select-none active:scale-95 ${
                isActive
                  ? 'text-sila-amber'
                  : 'text-sila-muted hover:text-sila-text'
              }`}
            >
              <div
                className={`relative p-1 rounded-full transition-transform duration-150 ease-out ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-0.5 inset-x-0 mx-auto w-1 h-1 rounded-full bg-sila-amber" />
                )}
              </div>
              <span
                className={`text-[11px] mt-0.5 tracking-tight font-arabic ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
