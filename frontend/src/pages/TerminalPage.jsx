import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BOOT_LINES, runTerminalCommand } from '../components/terminal/terminalCommands';
import { useAuth } from '../context/AuthContext';

const PROMPT = 'wired@exe:~$';

function makeId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }

function Line({ line }) {
  if (line.type === 'input') {
    return <div className="break-words"><span className="text-[#7CFF9C]">{PROMPT}</span> <span className="text-base">{line.text}</span></div>;
  }
  if (line.type === 'link') {
    return (
      <div className="break-words text-[#9BE7AE]">
        <span>{line.text} </span>
        <Link to={line.to} className="text-electric-light underline decoration-electric/40 underline-offset-2 hover:text-base">[{line.label || 'abrir'}]</Link>
      </div>
    );
  }
  if (line.type === 'error') return <div className="break-words text-red-400">{line.text}</div>;
  if (line.type === 'muted') return <div className="break-words text-[#6FAF7D]">{line.text}</div>;
  return <div className="break-words text-base">{line.text}</div>;
}

function MatrixOverlay({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);
  const chars = '01ã‚¢ã‚¤ã‚¦ã‚¨ã‚ªã‚«ã‚­ã‚¯ã‚±ã‚³ã‚µã‚·ã‚¹ã‚»ã‚½ã‚¿ãƒãƒ„ãƒ†ãƒˆ';
  const colCount = Math.max(12, Math.floor((typeof window !== 'undefined' ?window.innerWidth : 800) / 18));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black/55" aria-hidden="true">
      <div className="flex h-full justify-between px-2 opacity-60">
        {Array.from({ length: colCount }).map((_, i) => (
          <div key={i} className="matrix-col font-mono text-[11px] leading-4 text-electric-light" style={{ animationDelay: `${(i % 10) * 0.12}s`, animationDuration: `${1.4 + (i % 5) * 0.25}s` }}>
            {Array.from({ length: 40 }).map((__, j) => <div key={j}>{chars[(i * 7 + j * 13) % chars.length]}</div>)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TerminalPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [lines, setLines] = useState([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [effect, setEffect] = useState(null);
  const [booting, setBooting] = useState(true);
  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => { document.title = 'SECRET TERMINAL â€” WIRED.exe'; }, []);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setLines(BOOT_LINES.map((text) => ({ id: makeId(), type: 'muted', text })));
      setBooting(false);
      return;
    }
    let cancelled = false;
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      const text = BOOT_LINES[i];
      setLines((prev) => [...prev, { id: makeId(), type: 'muted', text }]);
      i += 1;
      if (i < BOOT_LINES.length) setTimeout(tick, 260);
      else setTimeout(() => { if (!cancelled) setBooting(false); }, 200);
    };
    tick();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }); }, [lines, busy, booting]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const onResize = () => { bottomRef.current?.scrollIntoView({ block: 'end' }); };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  const focusInput = () => inputRef.current?.focus();

  const pushLines = (newLines) => {
    setLines((prev) => [...prev, ...newLines.map((l) => ({ ...l, id: makeId() }))]);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const raw = value;
    const cmd = raw.trim();
    if (!cmd || busy || booting) return;
    setValue('');
    setHistory((prev) => [...prev, raw]);
    setHistoryIndex(-1);
    pushLines([{ type: 'input', text: raw }]);
    setBusy(true);
    try {
      const result = await runTerminalCommand(raw, { isAuthenticated, user });
      if (result.clear) { setLines([]); setBusy(false); return; }
      if (result.lines?.length) pushLines(result.lines);
      if (result.effect) {
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        if (!reduced) setEffect(result.effect);
      }
      if (result.exit) setTimeout(() => navigate('/'), 450);
    } catch {
      pushLines([{ type: 'error', text: 'Erro ao executar comando. Tente novamente.' }]);
    } finally {
      setBusy(false);
      setTimeout(focusInput, 0);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = historyIndex < 0 ?history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < 0) return;
      const next = historyIndex + 1;
      if (next >= history.length) { setHistoryIndex(-1); setValue(''); }
      else { setHistoryIndex(next); setValue(history[next] ?? ''); }
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#020402] text-base" onClick={focusInput}>
      <div className="mx-auto flex min-h-[100dvh] max-w-6xl flex-col px-3 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-6">
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-electric/25 bg-[#040A05] shadow-[0_0_0_1px_rgba(57,255,112,0.12),0_30px_100px_-40px_rgba(0,0,0,0.95)]">
          <div className="absolute inset-0 bg-grid opacity-[0.07] [background-size:24px_24px]" aria-hidden="true" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent" aria-hidden="true" />

          <header className="relative flex items-center justify-between gap-3 border-b border-electric/15 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-electric-light/85">WIRED.exe // SECRET TERMINAL</p>
              <p className="mt-0.5 truncate font-mono text-xs text-[#6FAF7D]">secure shell ? non-privileged environment</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={(e) => { e.stopPropagation(); setLines([]); setTimeout(focusInput, 0); }} className="rounded-md border border-electric/20 px-2.5 py-1.5 font-mono text-[11px] text-[#9BE7AE] transition hover:border-electric/45 hover:text-base">clear</button>
              <Link to="/" onClick={(e) => e.stopPropagation()} className="rounded-md border border-electric/20 px-2.5 py-1.5 font-mono text-[11px] text-[#9BE7AE] transition hover:border-electric/45 hover:text-base">exit</Link>
            </div>
          </header>

          <div ref={outputRef} className="relative min-h-0 flex-1 overflow-y-auto px-4 py-4 font-mono text-[13px] leading-relaxed sm:px-5 sm:text-sm" role="log" aria-live="polite">
            <div className="space-y-1.5">
              {lines.map((line) => <Line key={line.id} line={line} />)}
              {busy && <div className="text-[#6FAF7D]">processando<span className="terminal-cursor">_</span></div>}
              {!booting && (
                <form onSubmit={onSubmit} className="flex items-start gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <label htmlFor="terminal-input" className="sr-only">Comando do terminal</label>
                  <span className="shrink-0 text-[#7CFF9C]">{PROMPT}</span>
                  <div className="relative min-w-0 flex-1">
                    <input
                      id="terminal-input"
                      ref={inputRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoFocus
                      autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                      className="w-full bg-transparent text-base caret-[#7CFF9C] outline-none placeholder:text-[#4E765A]"
                      placeholder="type a command..."
                      aria-label="Entrada de comando"
                    />
                  </div>
                </form>
              )}
              <div ref={bottomRef} />
            </div>
          </div>

          <footer className="relative border-t border-electric/15 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#5E8F69] sm:px-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>Type &apos;help&apos; for commands ? arrows for history</span>
              <span className="hidden sm:inline">THE INTERNET IS PART OF REALITY.</span>
            </div>
          </footer>

          {effect === 'matrix' && <MatrixOverlay onDone={() => setEffect(null)} />}
          {effect === 'konami' && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-electric/5 font-mono text-sm text-electric-light animate-pulse">KONAMI SIGNAL ACCEPTED</div>}
          {effect === 'root' && <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 font-mono text-lg tracking-[0.2em] text-electric-light">ACCESS GRANTED</div>}
          {effect === 'hack' && <HackOverlay onDone={() => setEffect(null)} />}
        </div>
      </div>
      <style>{`
        .terminal-cursor { animation: terminal-blink 1s steps(2, start) infinite; }
        .matrix-col { animation: matrix-fall linear infinite; }
        @keyframes terminal-blink { to { visibility: hidden; } }
        @keyframes matrix-fall { from { transform: translateY(-30%); } to { transform: translateY(30%); } }
        @media (prefers-reduced-motion: reduce) { .terminal-cursor, .matrix-col { animation: none !important; } }
      `}</style>
    </div>
  );
}

function HackOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const msgs = ['SCANNING PORTS...', 'BYPASSING FIREWALL...', 'DECRYPTING NODE...', 'ACCESS DENIED (SIMULATION)'];
  useEffect(() => {
    if (step >= msgs.length) { const t = setTimeout(onDone, 450); return () => clearTimeout(t); }
    const t = setTimeout(() => setStep((s) => s + 1), 420);
    return () => clearTimeout(t);
  }, [step, onDone, msgs.length]);
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/45 px-4">
      <div className="w-full max-w-md rounded-lg border border-electric/25 bg-[#020402]/95 p-4 font-mono text-xs text-electric-light">
        {msgs.slice(0, step + 1).map((m) => <div key={m}>{m}</div>)}
      </div>
    </div>
  );
}
