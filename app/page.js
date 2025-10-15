"use client";
import { useState, useEffect } from "react";
import "../globals.css";

export default function Home() {
  const [token, setToken] = useState(localStorage.getItem("admin_token") || "");
  const [isLogged, setIsLogged] = useState(!!token);
  const [serverName, setServerName] = useState("");
  const [ram, setRam] = useState("1024");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    // automatic color scheme handled by CSS (prefers-color-scheme)
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem("admin_token", token);
    setIsLogged(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setToken("");
    setIsLogged(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ADMIN-TOKEN": localStorage.getItem("admin_token") || ""
        },
        body: JSON.stringify({ serverName, ram })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "Gagal terhubung: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <header className="top">
        <img src="/logo.svg" alt="Barmods logo" />
        <div>
          <h1>Barmods — Pterodactyl Creator</h1>
          <div className="muted">Create users & servers quickly</div>
        </div>
      </header>

      {!isLogged ? (
        <form onSubmit={handleLogin}>
          <label className="muted">Admin token</label>
          <input className="input" value={token} onChange={(e)=>setToken(e.target.value)} placeholder="Masukkan ADMIN_TOKEN" />
          <div style={{display:'flex', gap:8, marginTop:8}}>
            <button className="btn" type="submit">Login</button>
          </div>
          <p className="muted" style={{marginTop:8}}>Token disimpan di localStorage. Token harus sama dengan value ADMIN_TOKEN di environment.</p>
        </form>
      ) : (
        <>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
            <div className="muted">Terhubung sebagai admin</div>
            <button className="btn" onClick={handleLogout}>Logout</button>
          </div>

          <form onSubmit={handleCreate}>
            <label className="muted">Nama Server</label>
            <input className="input" required value={serverName} onChange={(e)=>setServerName(e.target.value)} placeholder="Contoh: bot-telegram" />

            <label className="muted">RAM</label>
            <select className="input" value={ram} onChange={(e)=>setRam(e.target.value)}>
              {[1,2,3,4,6,8,12].map(gb => <option key={gb} value={gb*1024}>{gb} GB</option>)}
            </select>

            <div style={{display:'flex', gap:8}}>
              <button className="btn" disabled={loading} type="submit">{loading ? "Membuat..." : "Buat Server"}</button>
            </div>
          </form>

          {result && (
            <div className="result">
              {result.error ? (
                <div style={{color:"#ff7b7b"}}>❌ {result.error}</div>
              ) : (
                <div>
                  <div style={{color:"#7efc9b", fontWeight:600}}>✅ Server Berhasil Dibuat!</div>
                  <div style={{marginTop:8}}><b>Panel:</b> {process.env.NEXT_PUBLIC_PTERO_DOMAIN || 'Panel URL'}</div>
                  <div><b>Email:</b> {result.email}</div>
                  <div><b>Username:</b> {result.username}</div>
                  <div><b>Password:</b> {result.password}</div>
                  <div><b>Server:</b> {result.server?.name || '—'}</div>
                </div>
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}
