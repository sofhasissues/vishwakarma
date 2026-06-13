"use client";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";

export default function QuizPage() {
  const [skill, setSkill] = useState("");
  const [targetRole, setTargetRole] = useState("Data Analyst");
  const [quiz, setQuiz] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function loadQuiz() {
    setLoading(true);
    setQuiz(null); setAnswers({}); setResult(null);
    try {
      const res = await axios.get(`/api/quiz/generate?skill=${encodeURIComponent(skill)}&target_role=${encodeURIComponent(targetRole)}`, { timeout: 30000 });
      setQuiz(res.data);
    } catch { alert("Failed to generate quiz"); }
    setLoading(false);
  }

  async function submitQuiz() {
    if (!quiz) return;
    setLoading(true);
    try {
      const res = await axios.post("/api/quiz/score", { questions: quiz.questions, answers }, { timeout: 30000 });
      setResult(res.data);
    } catch { }
    setLoading(false);
  }

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 2rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "var(--bg-base)", zIndex: 100 }}>
        <a href="/" style={{ fontWeight: 600, fontSize: "1.1rem", letterSpacing: "-0.02em", textDecoration: "none", color: "var(--text-primary)" }}>Vishwakarma</a>
        <a href="/tracker" style={{ fontSize: "0.875rem", color: "var(--text-muted)", textDecoration: "none" }}>← Tracker</a>
      </nav>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "3rem 2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>Skill Verification</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>5-question quiz. Pass 80%+ to mark skill as verified.</p>

        {!quiz && !result && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Skill</label>
                <input value={skill} onChange={e => setSkill(e.target.value)} placeholder="e.g. SQL" style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.4rem" }}>Target Role</label>
                <input value={targetRole} onChange={e => setTargetRole(e.target.value)} style={{ width: "100%", padding: "0.6rem 0.875rem", background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.9rem", outline: "none" }} />
              </div>
            </div>
            <button onClick={loadQuiz} disabled={!skill.trim() || loading} style={{ width: "100%", padding: "0.875rem", borderRadius: "8px", background: skill.trim() ? "var(--accent)" : "var(--bg-elevated)", color: skill.trim() ? "#fff" : "var(--text-muted)", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: skill.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Generate Quiz
            </button>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {quiz && !result && (
          <>
            <h2 style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "1.5rem" }}>{quiz.skill} — {quiz.questions?.length} questions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "2rem" }}>
              {quiz.questions?.map((q: any) => (
                <div key={q.id} style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "10px", padding: "1.25rem" }}>
                  <p style={{ fontWeight: 500, fontSize: "0.9rem", marginBottom: "1rem" }}>{q.id}. {q.question}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {q.options?.map((opt: string) => (
                      <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [String(q.id)]: opt }))} style={{ padding: "0.6rem 0.875rem", borderRadius: "6px", textAlign: "left", cursor: "pointer", border: `1px solid ${answers[String(q.id)] === opt ? "var(--accent)" : "var(--border)"}`, background: answers[String(q.id)] === opt ? "var(--accent-subtle)" : "var(--bg-elevated)", color: answers[String(q.id)] === opt ? "var(--accent)" : "var(--text-secondary)", fontSize: "0.875rem" }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={submitQuiz} disabled={Object.keys(answers).length < (quiz.questions?.length || 5) || loading} style={{ width: "100%", padding: "0.875rem", borderRadius: "8px", background: "var(--accent)", color: "#fff", fontWeight: 600, fontSize: "0.95rem", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              {loading ? <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> : null}
              Submit ({Object.keys(answers).length}/{quiz.questions?.length} answered)
            </button>
          </>
        )}

        {result && (
          <>
            <div style={{ textAlign: "center", padding: "2rem", background: result.passed ? "#0a1f0a" : "#1a0a0a", border: `1px solid ${result.passed ? "var(--success)" : "var(--destructive)"}`, borderRadius: "12px", marginBottom: "1.5rem" }}>
              <p style={{ fontSize: "3rem", fontWeight: 700, color: result.passed ? "var(--success)" : "var(--destructive)" }}>{result.score}%</p>
              <p style={{ fontWeight: 600, color: result.passed ? "var(--success)" : "var(--destructive)" }}>{result.passed ? "✓ Skill Verified!" : "✗ Not Yet Verified"}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{result.correct}/{result.total} correct</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {result.results?.map((r: any) => (
                <div key={r.id} style={{ background: "var(--bg-surface)", border: `1px solid ${r.is_correct ? "#1a3a1a" : "#3a1a1a"}`, borderRadius: "8px", padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {r.is_correct ? <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0 }} /> : <XCircle size={16} color="var(--destructive)" style={{ flexShrink: 0 }} />}
                    <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>{r.question}</p>
                  </div>
                  {!r.is_correct && <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>Your: {r.user_answer} | Correct: {r.correct_answer}</p>}
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.explanation}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--bg-surface)", border: "1px solid var(--border)", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 500 }}>Try Again</button>
              <button onClick={loadQuiz} style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer", fontWeight: 500 }}>New Quiz</button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
