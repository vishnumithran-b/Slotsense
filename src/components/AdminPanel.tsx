import { useState } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  RefreshCw,
  Wrench,
  CircleDot,
  Car,
  Clock,
  Trash2,
  MapPin,
  CheckCircle2,
  X,
} from 'lucide-react';
import { type ParkingSlot, type ParkingZone, type ActivityLog, type SlotStatus, STATUS_LABEL, STATUS_COLORS } from '@/types';
import { GlassCard, SectionHeading } from '@/components/ui/Glass';
import { verifyAdmin, resetAllSlots, setSlotStatus, updateZone } from '@/lib/db';

interface AdminPanelProps {
  slots: ParkingSlot[];
  zones: ParkingZone[];
  logs: ActivityLog[];
  isAdmin: boolean;
  onLoginChange: (isAdmin: boolean) => void;
  onSlotChanged: () => void;
}

const STATUS_ICON: Record<SlotStatus, typeof Car> = {
  available: CircleDot,
  occupied: Car,
  reserved: Lock,
  maintenance: Wrench,
};

export function AdminPanel({ slots, zones, logs, isAdmin, onLoginChange, onSlotChanged }: AdminPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [editingZone, setEditingZone] = useState<number | null>(null);
  const [zoneForm, setZoneForm] = useState({ name: '', color: '', lat: '', lng: '' });
  const [resetting, setResetting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError(null);
    try {
      const ok = await verifyAdmin(username.trim(), password);
      if (ok) {
        onLoginChange(true);
        showToast('Admin login successful');
      } else {
        setAuthError('Invalid username or password.');
      }
    } catch {
      setAuthError('Login failed. Try again.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    onLoginChange(false);
    setUsername('');
    setPassword('');
  };

  const handleStatusChange = async (slot: ParkingSlot, status: SlotStatus) => {
    setBusyId(slot.id);
    try {
      await setSlotStatus(slot.id, status);
      await onSlotChanged();
      showToast(`Slot ${slot.label} → ${STATUS_LABEL[status]}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetAllSlots();
      await onSlotChanged();
      showToast('All slots reset to available');
    } finally {
      setResetting(false);
    }
  };

  const startEditZone = (zone: ParkingZone) => {
    setEditingZone(zone.id);
    setZoneForm({ name: zone.name, color: zone.color, lat: String(zone.lat), lng: String(zone.lng) });
  };

  const saveZone = async (id: number) => {
    const lat = parseFloat(zoneForm.lat);
    const lng = parseFloat(zoneForm.lng);
    if (!zoneForm.name || isNaN(lat) || isNaN(lng)) return;
    await updateZone(id, { name: zoneForm.name, color: zoneForm.color || '#288760', lat, lng });
    await onSlotChanged();
    setEditingZone(null);
    showToast('Zone updated');
  };

  if (!isAdmin) {
    return (
      <section className="relative z-10 py-14">
        <div className="mx-auto max-w-md px-4 md:px-6">
          <SectionHeading eyebrow="Admin Access" title="Security Login" />
          <GlassCard strong className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-jade/20 text-mint">
                <Shield size={22} />
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-white">Admin Login</h3>
                <p className="text-sm text-white/55">Sign in to manage zones and slots.</p>
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl glass bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-mint/40"
                autoComplete="username"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl glass bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-mint/40"
                autoComplete="current-password"
              />
              {authError && (
                <div className="rounded-2xl bg-red-500/15 px-4 py-2.5 text-sm text-red-200">
                  {authError}
                </div>
              )}
              <button
                type="submit"
                disabled={loggingIn}
                className="glow-btn flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60"
              >
                <Lock size={16} />
                {loggingIn ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-white/40">
              Demo credentials — admin / admin123
            </p>
          </GlassCard>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex items-center justify-between">
          <SectionHeading eyebrow="Admin Mode" title="Manage Parking System" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-2xl glass px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {/* Zone management */}
        <GlassCard className="mb-6 p-5">
          <h3 className="font-display text-lg font-bold text-white">Parking Zones</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {zones.map((zone) => (
              <div key={zone.id} className="rounded-2xl glass p-4">
                {editingZone === zone.id ? (
                  <div className="space-y-2">
                    <input
                      value={zoneForm.name}
                      onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                      placeholder="Zone name"
                      className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mint/40"
                    />
                    <div className="flex gap-2">
                      <input
                        value={zoneForm.color}
                        onChange={(e) => setZoneForm({ ...zoneForm, color: e.target.value })}
                        placeholder="Color"
                        className="w-24 rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mint/40"
                      />
                      <input
                        value={zoneForm.lat}
                        onChange={(e) => setZoneForm({ ...zoneForm, lat: e.target.value })}
                        placeholder="Lat"
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mint/40"
                      />
                      <input
                        value={zoneForm.lng}
                        onChange={(e) => setZoneForm({ ...zoneForm, lng: e.target.value })}
                        placeholder="Lng"
                        className="w-full rounded-xl bg-white/5 px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-mint/40"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveZone(zone.id)}
                        className="flex items-center gap-1.5 rounded-xl glow-btn px-3 py-2 text-xs font-bold text-white"
                      >
                        <CheckCircle2 size={14} /> Save
                      </button>
                      <button
                        onClick={() => setEditingZone(null)}
                        className="flex items-center gap-1.5 rounded-xl glass px-3 py-2 text-xs font-semibold text-white/70"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full"
                        style={{ background: zone.color, boxShadow: `0 0 8px ${zone.color}` }}
                      />
                      <div>
                        <div className="font-semibold text-white">{zone.name}</div>
                        <div className="text-xs text-white/45">
                          {zone.lat.toFixed(5)}, {zone.lng.toFixed(5)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => startEditZone(zone)}
                      className="rounded-xl glass px-3 py-1.5 text-xs font-semibold text-white/70 hover:bg-white/10"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Slot management */}
        <GlassCard className="mb-6 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-white">Slot Status Control</h3>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center gap-2 rounded-2xl glass px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors disabled:opacity-60"
            >
              <RefreshCw size={15} className={resetting ? 'animate-spin' : ''} />
              {resetting ? 'Resetting...' : 'Reset All Slots'}
            </button>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Change any slot's status or mark it for maintenance. Changes save instantly.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {slots.map((slot) => {
              const c = STATUS_COLORS[slot.status];
              const Icon = STATUS_ICON[slot.status];
              const isBusy = busyId === slot.id;
              return (
                <div
                  key={slot.id}
                  className="rounded-2xl p-3"
                  style={{ background: `${c}1a`, border: `1px solid ${c}44` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold" style={{ color: c }}>
                      {slot.label}
                    </span>
                    <Icon size={14} style={{ color: c }} />
                  </div>
                  <div className="mt-1 text-[10px] text-white/45">{slot.zone_name}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(['available', 'occupied', 'reserved', 'maintenance'] as SlotStatus[]).map((st) => {
                      const active = slot.status === st;
                      return (
                        <button
                          key={st}
                          onClick={() => handleStatusChange(slot, st)}
                          disabled={isBusy}
                          className="rounded-lg px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide transition-colors disabled:opacity-40"
                          style={{
                            background: active ? STATUS_COLORS[st] : 'rgba(255,255,255,0.06)',
                            color: active ? '#fff' : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {st.slice(0, 4)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Activity logs */}
        <GlassCard className="p-5">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-mint" />
            <h3 className="font-display text-lg font-bold text-white">Activity Logs</h3>
          </div>
          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto no-scrollbar">
            {logs.length === 0 ? (
              <p className="text-sm text-white/40">No activity yet.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-mint" />
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {log.action}
                      {log.detail && <span className="font-normal text-white/55"> — {log.detail}</span>}
                    </div>
                    <div className="text-xs text-white/40">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-up rounded-2xl glass-strong px-5 py-3 text-sm font-semibold text-mint">
          {toast}
        </div>
      )}
    </section>
  );
}
