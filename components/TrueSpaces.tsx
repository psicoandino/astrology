"use client";

import { calcPositions, type PlanetPosition } from "@/lib/astronomy";
import { CAT_META, FAST_BODIES, type PlanetCategory } from "@/lib/planets";
import {
  applyTheme,
  captureBackground,
  getStoredTheme,
  UI,
  type Theme,
} from "@/lib/ui";
import html2canvas from "html2canvas";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Mode = "live" | "custom";

function ArcSVG() {
  return (
    <svg className="arc" viewBox="0 0 380 11" aria-hidden>
      <path
        d="M0,10 Q190,1 380,10"
        strokeWidth="0.7"
        fill="none"
      />
    </svg>
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function CategoryLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="cat" aria-hidden>
      <span className="cat-dot" style={{ background: color }} />
      {label}
    </div>
  );
}

function PlanetRow({
  p,
  meta,
  ac,
  isApprox,
  showArc,
}: {
  p: PlanetPosition;
  meta: { color: string };
  ac: string;
  isApprox: boolean;
  showArc: boolean;
}) {
  const degreeLabel = isApprox ? `~${p.degree}°` : `${p.degree}°`;
  const ariaLabel = `${p.name}, ${p.constellation.name} ${degreeLabel}${
    p.retro ? ", retrógrado" : ""
  }, próximo signo ${p.nextConst.name}`;

  return (
    <>
      <div
        className={`row${p.retro ? " is-retro" : ""}`}
        aria-label={ariaLabel}
      >
        <div className={`sign${ac}`}>
          <span className="s-sym" aria-hidden>
            {p.constellation.sym}
          </span>
          <span className="s-name">{p.constellation.short}</span>
        </div>
        <div className="planet">
          <span className={`p-sym cat-${p.cat}`} aria-hidden>
            {p.sym}
          </span>
          <span className="p-name">{p.name}</span>
          {p.retro && (
            <span className="retro-badge">
              {UI.retro} retrógrado
            </span>
          )}
          <span className="p-deg">{degreeLabel}</span>
          <div className="prog-wrap" role="presentation">
            <div
              className="prog"
              style={{
                width: `${p.pct.toFixed(0)}%`,
                background: meta.color,
              }}
            />
          </div>
        </div>
        <div className={`sign r${ac}`}>
          <span className="s-sym" aria-hidden>
            {p.nextConst.sym}
          </span>
          <span className="s-name">{p.nextConst.short}</span>
        </div>
      </div>
      {showArc && <ArcSVG />}
    </>
  );
}

export default function TrueSpaces() {
  const cardRef = useRef<HTMLDivElement>(null);
  const dioramaRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mounted, setMounted] = useState(false);
  const [liveSpin, setLiveSpin] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const [mode, setMode] = useState<Mode>("live");
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [isApproximate, setIsApproximate] = useState(false);
  const [contextLabel, setContextLabel] = useState(
    () => `${UI.live} tiempo real · ahora`,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [inputDate, setInputDate] = useState("");
  const [inputTime, setInputTime] = useState("");
  const [dateError, setDateError] = useState("");
  const [positions, setPositions] = useState<PlanetPosition[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [clock, setClock] = useState({
    time: "",
    date: "",
    tz: "",
    iso: "",
  });

  const refresh = useCallback(() => {
    const date = mode === "live" ? new Date() : targetDate;
    if (!date) return;
    try {
      setPositions(calcPositions(date));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPositions(null);
    }
  }, [mode, targetDate]);

  const tickClock = useCallback(() => {
    const now = new Date();
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const off = -now.getTimezoneOffset();
    const tz =
      (off >= 0 ? "+" : "-") +
      pad(Math.floor(Math.abs(off) / 60)) +
      ":" +
      pad(Math.abs(off) % 60);
    setClock({
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
      date: `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`,
      tz: `UTC ${tz}`,
      iso: now.toISOString(),
    });
  }, []);

  useEffect(() => {
    const initialTheme = getStoredTheme();
    applyTheme(initialTheme);
    setTheme(initialTheme);
    setMounted(true);
    refresh();
    tickClock();
  }, [refresh, tickClock]);

  useEffect(() => {
    if (!mounted) return;
    refresh();
  }, [mounted, refresh]);

  useEffect(() => {
    if (!mounted) return;
    const id = setInterval(tickClock, 1000);
    return () => clearInterval(id);
  }, [mounted, tickClock]);

  useEffect(() => {
    if (!mounted || mode !== "live") return;
    const id = setInterval(refresh, 300000);
    return () => clearInterval(id);
  }, [mounted, mode, refresh]);

  useEffect(() => {
    document.body.classList.toggle("modal-open", modalOpen);
    return () => document.body.classList.remove("modal-open");
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const t = setTimeout(() => dateInputRef.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
  };

  const showToast = (msg: string, duration = 2800) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(""), duration);
  };

  const openModal = () => {
    setDateError("");
    if (mode === "custom" && targetDate) {
      const d = targetDate;
      setInputDate(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      );
      setInputTime(
        d.getHours() || d.getMinutes()
          ? `${pad(d.getHours())}:${pad(d.getMinutes())}`
          : "",
      );
    } else {
      const now = new Date();
      setInputDate(
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      );
      setInputTime("");
    }
    setModalOpen(true);
  };

  const pulseDiorama = useCallback(() => {
    const el = dioramaRef.current;
    if (!el) return;
    el.classList.remove("diorama-pulse");
    void el.offsetWidth;
    el.classList.add("diorama-pulse");
    window.setTimeout(() => el.classList.remove("diorama-pulse"), 500);
  }, []);

  const applyDate = () => {
    if (!inputDate) {
      setDateError("Selecciona una fecha para continuar.");
      dateInputRef.current?.focus();
      return;
    }
    setDateError("");
    const [y, mo, d] = inputDate.split("-").map(Number);
    let next: Date;
    if (inputTime) {
      const [h, mi] = inputTime.split(":").map(Number);
      next = new Date(y, mo - 1, d, h, mi, 0);
      setIsApproximate(false);
    } else {
      next = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
      setIsApproximate(true);
    }
    setMode("custom");
    setTargetDate(next);
    const months = [
      "Ene", "Feb", "Mar", "Abr", "May", "Jun",
      "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
    ];
    setContextLabel(
      `${UI.date} ${d} ${months[mo - 1]} ${y}${inputTime ? ` · ${inputTime}` : " · aprox."}`,
    );
    setModalOpen(false);
    try {
      setPositions(calcPositions(next));
      setError(null);
      pulseDiorama();
      showToast(`${UI.ok} posiciones calculadas`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPositions(null);
    }
  };

  const resetToLive = useCallback(
    (closeModal = true) => {
      setMode("live");
      setTargetDate(null);
      setIsApproximate(false);
      setContextLabel(`${UI.live} tiempo real · ahora`);
      setDateError("");
      if (closeModal) setModalOpen(false);
      try {
        setPositions(calcPositions(new Date()));
        setError(null);
        pulseDiorama();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setPositions(null);
      }
    },
    [pulseDiorama],
  );

  const handleLive = useCallback(() => {
    if (mode === "custom") {
      resetToLive(true);
      showToast(`${UI.live} en vivo`);
      return;
    }
    refresh();
    tickClock();
    pulseDiorama();
    setLiveSpin(true);
    window.setTimeout(() => setLiveSpin(false), 600);
    showToast(`${UI.ok} actualizado · ahora`);
  }, [mode, resetToLive, refresh, tickClock, pulseDiorama]);

  const fallbackDownload = (canvas: HTMLCanvasElement, fname: string) => {
    const link = document.createElement("a");
    link.download = fname;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showToast(`${UI.ok} imagen descargada`);
  };

  const captureAndShare = async () => {
    if (!cardRef.current || !positions) return;
    setShareLoading(true);
    const stickyTop = document.querySelector(".sticky-top") as HTMLElement | null;
    const stickyBot = document.querySelector(".sticky-bar") as HTMLElement | null;
    const prevTop = stickyTop?.style.display;
    const prevBot = stickyBot?.style.display;
    const prevPad = document.body.style.paddingTop;
    if (stickyTop) stickyTop.style.display = "none";
    if (stickyBot) stickyBot.style.display = "none";
    document.body.style.paddingTop = "0";

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: captureBackground(theme),
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const now = new Date();
      const fname = `true-spaces-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) {
          fallbackDownload(canvas, fname);
          return;
        }
        if (navigator.share && navigator.canShare) {
          const file = new File([blob], fname, { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "True Spaces · Posiciones Planetarias",
                files: [file],
              });
              showToast(`${UI.ok} compartido`);
              return;
            } catch {
              fallbackDownload(canvas, fname);
              return;
            }
          }
        }
        fallbackDownload(canvas, fname);
      }, "image/png");
    } catch {
      showToast(`${UI.fail} error al generar imagen`);
    } finally {
      if (stickyTop) stickyTop.style.display = prevTop ?? "";
      if (stickyBot) stickyBot.style.display = prevBot ?? "";
      document.body.style.paddingTop = prevPad;
      setShareLoading(false);
    }
  };

  const rows: ReactNode[] = [];
  let lastCat: PlanetCategory | null = null;

  if (positions) {
    const visible = positions.filter((p) => !p.error);
    visible.forEach((p, i) => {
      const meta = CAT_META[p.cat];
      const isApprox = isApproximate && FAST_BODIES.has(p.name);
      const ac = isApprox ? " approx" : "";

      if (p.cat !== lastCat) {
        rows.push(
          <CategoryLabel key={`cat-${p.cat}`} label={meta.label} color={meta.color} />,
        );
        lastCat = p.cat;
      }

      rows.push(
        <PlanetRow
          key={p.key}
          p={p}
          meta={meta}
          ac={ac}
          isApprox={isApprox}
          showArc={i < visible.length - 1}
        />,
      );
    });
  }

  const themeIcon = theme === "light" ? UI.themeDark : UI.themeLight;
  const themeLabel =
    theme === "light" ? "Activar modo oscuro" : "Activar modo claro";

  return (
    <>
      <header className="sticky-top">
        <div className="top-inner">
          <div className="top-left">
            <p className="top-label">POSICIONES REALES · IAU · GEOCÉNTRICO</p>
            <h1 className="top-name">TRUE SPACES</h1>
            <p className="top-context" aria-live="polite">
              {contextLabel}
            </p>
          </div>
          <div className="top-actions">
            <button
              type="button"
              className="btn-icon-only btn-theme"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              <span className="sym" aria-hidden>
                {themeIcon}
              </span>
            </button>
            <button
              type="button"
              className={`btn-mode${mode === "live" ? " live-active" : ""}${liveSpin ? " spin" : ""}`}
              onClick={handleLive}
              disabled={!mounted || shareLoading}
              aria-label={
                mode === "live"
                  ? "Actualizar posiciones en tiempo real"
                  : "Volver a tiempo real"
              }
              title={mode === "live" ? "Actualizar ahora" : "Volver a LIVE"}
            >
              <span className="btn-icon sym" aria-hidden>
                {UI.live}
              </span>
              LIVE
            </button>
            <button
              type="button"
              className={`btn-date${mode === "custom" ? " date-active" : ""}`}
              onClick={openModal}
              disabled={!mounted}
              aria-label="Elegir fecha y hora"
              aria-expanded={modalOpen}
            >
              <span className="btn-icon sym" aria-hidden>
                {UI.date}
              </span>
              FECHA
            </button>
            <button
              type="button"
              className={`btn-share${shareLoading ? " loading" : ""}`}
              onClick={captureAndShare}
              disabled={shareLoading || !positions || !mounted}
              aria-label="Guardar imagen de las posiciones"
              aria-busy={shareLoading}
            >
              <span className="btn-icon sym" aria-hidden>
                {shareLoading ? UI.loading : UI.download}
              </span>
              IMG
            </button>
          </div>
        </div>
      </header>

      <div
        className={`toast${toast ? " show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>

      <main className="card" ref={cardRef}>
        <div className="col-hdrs" aria-hidden>
          <span className="ch">signo actual</span>
          <span className="ch c">planeta · grado</span>
          <span className="ch r">{UI.arrow} próximo signo</span>
        </div>

        <div
          id="diorama"
          ref={dioramaRef}
          aria-label="Posiciones planetarias"
        >
          {!mounted ? (
            <p className="msg">
              <span className="sym">{UI.refresh}</span> calculando posiciones…
            </p>
          ) : error ? (
            <div className="error-panel" role="alert">
              <p className="error-title">NO SE PUDO CALCULAR</p>
              <p className="error-msg">{error}</p>
              <button type="button" className="btn-retry" onClick={refresh}>
                REINTENTAR
              </button>
            </div>
          ) : !positions ? (
            <p className="msg">
              <span className="sym">{UI.refresh}</span> calculando posiciones…
            </p>
          ) : (
            <>
              {isApproximate && (
                <p className="approx-banner" role="note">
                  Sin hora: Luna, Mercurio y Venus = posición aproximada (mediodía
                  UTC).
                </p>
              )}
              {rows}
            </>
          )}
        </div>

        <footer className="app-footer">
          <details>
            <summary>Acerca del cálculo</summary>
            Barra de progreso = grado dentro del signo (0° {UI.arrow} límite IAU).
            <br />
            Motor: Astronomy Engine (Don Cross) · límites IAU oficiales.
          </details>
        </footer>
      </main>

      <footer className="sticky-bar" aria-label="Reloj local">
        <div className="bar-inner">
          <div className="bar-earth">
            <span className="bar-dot" aria-hidden />
            <span className="sym" aria-hidden>
              {UI.earth}
            </span>{" "}
            EARTH
          </div>
          {mounted && clock.time ? (
            <time className="bar-time" dateTime={clock.iso}>
              {clock.time}
            </time>
          ) : (
            <span className="bar-time bar-time--placeholder" aria-hidden>
              00:00:00
            </span>
          )}
          <div>
            {mounted && clock.date ? (
              <>
                <div className="bar-date">{clock.date}</div>
                <div className="bar-tz">{clock.tz}</div>
              </>
            ) : (
              <>
                <div className="bar-date bar-time--placeholder" aria-hidden>
                  — — —
                </div>
                <div className="bar-tz bar-time--placeholder" aria-hidden>
                  UTC —
                </div>
              </>
            )}
          </div>
        </div>
      </footer>

      <div
        className={`modal-overlay${modalOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setModalOpen(false);
        }}
        role="presentation"
        aria-hidden={!modalOpen}
      >
        <div
          className="modal-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <h2 id="modal-title" className="modal-title">
            CALCULAR POSICIONES
          </h2>
          <p className="modal-sub">
            Elige una fecha. La hora es opcional; sin ella, los cuerpos rápidos
            se marcan como aproximados.
          </p>
          <div className="field">
            <label htmlFor="input-date">FECHA</label>
            <input
              ref={dateInputRef}
              id="input-date"
              type="date"
              value={inputDate}
              onChange={(e) => {
                setInputDate(e.target.value);
                if (dateError) setDateError("");
              }}
              aria-invalid={!!dateError}
              aria-describedby={dateError ? "date-error" : undefined}
            />
            {dateError && (
              <p id="date-error" className="field-error" role="alert">
                {dateError}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="input-time">HORA (opcional)</label>
            <input
              id="input-time"
              type="time"
              value={inputTime}
              onChange={(e) => setInputTime(e.target.value)}
            />
            <small>Luna, Mercurio y Venus dependen de la hora exacta.</small>
          </div>
          <div className="modal-actions modal-actions--dual">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setModalOpen(false)}
            >
              CANCELAR
            </button>
            <button type="button" className="btn-go" onClick={applyDate}>
              CALCULAR {UI.arrow}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
