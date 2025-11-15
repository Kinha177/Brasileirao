import { ReactNode } from 'react';
import { Menu, Trophy, Users, Calendar, BarChart3, ShirtIcon } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const menuItems = [
    { id: 'classificacao', label: 'Classificação', icon: Trophy },
    { id: 'clubes', label: 'Clubes', icon: ShirtIcon },
    { id: 'jogadores', label: 'Jogadores', icon: Users },
    { id: 'partidas', label: 'Partidas', icon: Calendar },
    { id: 'estatisticas', label: 'Estatísticas', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-green-500 to-yellow-500 p-2 rounded-lg shadow-md">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Brasileirão</h1>
                <p className="text-xs text-slate-500">Sistema de Gerenciamento</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-slate-200">
                <Menu className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-800">Menu</h2>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
