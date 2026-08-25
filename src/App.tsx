import { useCallback, useState } from 'react';
import { NavBar } from '@/components/NavBar';
import { HeroDashboard } from '@/components/HeroDashboard';
import { ParkingMapSection } from '@/components/parking/ParkingMapSection';
import { CameraSimulation } from '@/components/CameraSimulation';
import { AnalyticsSection } from '@/components/AnalyticsSection';
import { SystemFlowSection } from '@/components/SystemFlowSection';
import { AdminPanel } from '@/components/AdminPanel';
import { useDatabase } from '@/hooks/useDatabase';

function App() {
  const { slots, zones, stats, logs, loading, refresh } = useDatabase();
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const handleRefresh = useCallback(async () => {
    await refresh();
    setLastUpdated(new Date());
  }, [refresh]);

  const handleSlotChanged = useCallback(async () => {
    await refresh();
    setLastUpdated(new Date());
  }, [refresh]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient background orbs */}
      <div className="bg-orb" style={{ top: '-10%', left: '-5%', width: 420, height: 420, background: '#288760' }} />
      <div className="bg-orb" style={{ top: '40%', right: '-10%', width: 380, height: 380, background: '#1A5140' }} />
      <div
        className="bg-orb"
        style={{ bottom: '-5%', left: '30%', width: 360, height: 360, background: '#5CA87C', opacity: 0.22 }}
      />

      <NavBar isAdmin={isAdmin} />

      <main id="dashboard">
        <HeroDashboard stats={stats} loading={loading} lastUpdated={lastUpdated} onRefresh={handleRefresh} />

        <div id="map">
          {!loading && (
            <ParkingMapSection
              slots={slots}
              zones={zones}
              stats={stats}
              isAdmin={isAdmin}
              onSlotChanged={handleSlotChanged}
            />
          )}
        </div>

        <div id="camera">
          <CameraSimulation onScanComplete={handleSlotChanged} />
        </div>

        <div id="analytics">
          <AnalyticsSection stats={stats} />
        </div>

        <div id="flow">
          <SystemFlowSection />
        </div>

        <div id="admin">
          <AdminPanel
            slots={slots}
            zones={zones}
            logs={logs}
            isAdmin={isAdmin}
            onLoginChange={setIsAdmin}
            onSlotChanged={handleSlotChanged}
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <p className="text-sm text-white/40">
            SlotSense — A full-stack liquid-glass smart campus parking app. AI vision is simulated.
            Data persists in your browser via an in-browser Postgres database.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
