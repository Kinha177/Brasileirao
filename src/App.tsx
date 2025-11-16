// ARQUIVO: src/App.tsx
import { useState } from 'react';
import Layout from './components/Layout';
import ClassificacaoView from './components/ClassificacaoView';
import ClubesView from './components/ClubesView';
import JogadoresView from './components/JogadoresView';
import PartidasView from './components/PartidasView';
import EstatisticasView from './components/EstatisticasView';
// --- NOVOS IMPORTS ADICIONADOS ABAIXO ---
import TemporadasView from './components/TemporadasView';
import EstadiosView from './components/EstadiosView';

function App() {
  const [currentView, setCurrentView] = useState('classificacao');

  const renderView = () => {
    switch (currentView) {
      case 'classificacao':
        return <ClassificacaoView />;
      case 'clubes':
        return <ClubesView />;
      case 'jogadores':
        return <JogadoresView />;
      case 'partidas':
        return <PartidasView />;
      case 'estatisticas':
        return <EstatisticasView />;
      // --- NOVOS CASES ADICIONADOS ABAIXO ---
      case 'temporadas':
        return <TemporadasView />;
      case 'estadios':
        return <EstadiosView />;
      default:
        return <ClassificacaoView />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
}

export default App;