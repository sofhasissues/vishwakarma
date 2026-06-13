"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Bell, Mail, MessageSquare, Phone, Save, Loader2, Copy, Check } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [userId, setUserId] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const id = (session?.user as any)?.id;
    if (id) setUserId(id);
  }, [session]);

  function copyUserId() {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  const [email, setEmailNotif] = useState(true);
  const [sms, setSms] = useState(false);
  const [whatsapp, setWhatsapp] = useState(false);
  const [phone, setPhone] = useState("");
  const [jobDeadline, setJobDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function savePreferences() {
    if (!userId) { setError("Enter your user ID"); return; }
    setLoading(true);
    setError(null);
    try {
      await axios.patch(`/api/notifications/preferences/${userId}`, {
        notification_email: email,
        notification_sms: sms,
        notification_whatsapp: whatsapp,
        phone_number: phone || null,
        job_deadline: jobDeadline || null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to save");
    }
    setLoading(false);
  }

  async function sendTestNotification(channel: string) {
    if (!userId) { setError("Enter your user ID first"); return; }
    try {
      await axios.post("/api/notifications/test", { user_id: userId, channel });
      alert(`Test ${channel} sent!`);
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to send test");
    }
  }

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none", cursor: "pointer",
      background: value ? "var(--accent)" : "var(--border)", transition: "background 0.2s",
      position: "relative",
    }}>
      <div style={{
        width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
        position: "absolute", top: "3px", transition: "left 0.2s",
        left: value ? "23px" : "3px",
      }} />
    </button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 2rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg-base)", zIndex: 100 }}>
        <a href="/" style={{ fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "var(--text-primary)" }}>Vishwakarma</a>
        <a href="/dashboard" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>← Dashboard</a>
      </nav>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Notification Settings
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
          Choose how and when Vishwakarma reminds you about your deadlines.
        </p>

        {/* User ID — auto-filled from session */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.25rem" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>Your User ID</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text-secondary)", flex: 1, wordBreak: "break-all", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px" }}>
              {userId || "Sign in to see your ID"}
            </p>
            {userId && (
              <button onClick={copyUserId} style={{ flexShrink: 0, background: copiedId ? "var(--accent-subtle)" : "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "8px", padding: "0.5rem 0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", color: copiedId ? "var(--accent)" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: 500, transition: "all 0.2s", whiteSpace: "nowrap" }}>
                {copiedId ? <Check size={14} /> : <Copy size={14} />}
                {copiedId ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
        </div>

        {/* Job deadline */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem" }}>Job Application Deadline</h3>
          <input type="date" value={jobDeadline} onChange={e => setJobDeadline(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }} />
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
            You'll be notified when this is 7 days away.
          </p>
        </div>

        {/* Notification channels */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.25rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.25rem" }}>Notification Channels</h3>

          {[
            { label: "Email", icon: Mail, value: email, onChange: setEmailNotif, channel: "email", noPhone: true },
            { label: "SMS", icon: Phone, value: sms, onChange: setSms, channel: "sms", noPhone: false },
            { label: "WhatsApp", icon: MessageSquare, value: whatsapp, onChange: setWhatsapp, channel: "whatsapp", noPhone: false },
          ].map(({ label, icon: Icon, value, onChange, channel, noPhone }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border-subtle)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--accent-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={16} color="var(--accent)" />
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{label}</p>
                  {!noPhone && value && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Requires phone number below</p>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {value && (
                  <button onClick={() => sendTestNotification(channel)} style={{ fontSize: "0.7rem", color: "var(--text-muted)", background: "none", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.2rem 0.5rem", cursor: "pointer" }}>
                    Test
                  </button>
                )}
                <Toggle value={value} onChange={onChange} />
              </div>
            </div>
          ))}

          {(sms || whatsapp) && (
            <div style={{ marginTop: "0.5rem" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Phone Number (with country code)</label>
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-elevated)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }} />
            </div>
          )}
        </div>

        {/* When to notify */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem" }}>When You'll Be Notified</h3>
          {[
            "3 days before a milestone deadline",
            "7 days before your job application deadline",
            "When a milestone is 0% progress and due soon",
          ].map((trigger, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Bell size={12} color="var(--accent)" />
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{trigger}</p>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ color: "var(--destructive)", fontSize: "0.875rem", marginBottom: "1rem", padding: "0.75rem", background: "#1a0a0a", borderRadius: "6px" }}>
            {error}
          </div>
        )}

        <button onClick={savePreferences} disabled={loading} style={{ width: "100%", padding: "0.875rem", borderRadius: "8px", background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
          {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={18} />}
          {saved ? "Saved!" : "Save Preferences"}
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </button>
      </div>
    </main>
  );
}
