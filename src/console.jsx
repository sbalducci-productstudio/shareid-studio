/* ShareID Studio — Console: Home (control tower) + Stats / Reporting. */


import React from "react";
import { BarRows, CONSOLE_DATA, Donut, Funnel, Gauge, LineChart, Sparkline, StatCard, fmt, fmtFull } from "./charts.jsx";
import { Ico } from "./core.jsx";
import { Home } from "./steps1.jsx";

export function ModeToggle({ mode, onChange }) {
  return (
    <div className="view-seg mode-toggle">
      <button className={"view-seg-b" + (mode === "test" ? " on" : "")} onClick={() => onChange("test")}>Test</button>
      <button className={"view-seg-b" + (mode === "live" ? " on" : "")} onClick={() => onChange("live")}>Live</button>
    </div>);
}
export function PeriodSeg({ value, onChange, options }) {
  return (
    <div className="view-seg">
      {options.map((o) => <button key={o} className={"view-seg-b" + (value === o ? " on" : "")} onClick={() => onChange(o)}>{o}</button>)}
    </div>);
}
export function Panel({ title, sub, right, children, span }) {
  return (
    <div className={"panel" + (span ? " span" : "")}>
      <div className="panel-h"><div><div className="panel-t">{title}</div>{sub && <div className="panel-sub">{sub}</div>}</div>{right}</div>
      <div className="panel-body">{children}</div>
    </div>);
}

export function ConsoleHome({ onNav }) {
  const [mode, setMode] = React.useState("live");
  const [period, setPeriod] = React.useState("30 j");
  const D = CONSOLE_DATA;
  const testZero = mode === "test";
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Console</div><h1>Accueil</h1></div>
        <div className="topbar-controls"><PeriodSeg value={period} onChange={setPeriod} options={["7 j", "30 j"]} /><ModeToggle mode={mode} onChange={setMode} /></div>
      </div>
      <div className="dash-body console-body">
        {/* alerts */}
        {!testZero &&
          <div className="alert-band">
            {D.alerts.map((a, i) =>
              <div className={"alert-card " + a.tone} key={i}>
                <span className="alert-ico"><Ico name={a.icon} size={16} /></span>
                <div className="alert-txt"><div className="alert-t">{a.t}</div><div className="alert-d">{a.d}</div></div>
              </div>)}
          </div>}

        {/* KPI hero */}
        <div className="kpi-grid">
          {D.kpis.map((k) =>
            <StatCard key={k.id} label={k.label} value={testZero ? "0" : k.value} unit={k.unit} delta={testZero ? null : k.delta} invert={k.invert} sub={k.sub} spark={k.id === "vol" && !testZero ? k.spark : null} />)}
        </div>

        <div className="panel-grid">
          <Panel title="Funnel de vérification" sub="Démarrées → décision → acceptées" span>
            {testZero ? <Empty /> : <Funnel stages={D.funnel} />}
          </Panel>
          <Panel title="Mix méthode de capture" sub="Différenciateur eIDAS : pass rate NFC">
            {testZero ? <Empty /> : <Donut data={D.mix} center={{ v: fmt(D.mix.reduce((s, m) => s + m.v, 0)), l: "captures" }} />}
          </Panel>
        </div>

        <div className="panel-grid three">
          <Panel title="Top pays" sub="top 5">{testZero ? <Empty /> : <BarRows data={D.countries} />}</Panel>
          <Panel title="Top documents" sub="top 5">{testZero ? <Empty /> : <BarRows data={D.docs} accent="#7E97E8" />}</Panel>
          <Panel title="Plateformes" sub="web / iOS / Android">{testZero ? <Empty /> : <BarRows data={D.platforms} accent="#1F6F5B" />}</Panel>
        </div>

        <div className="panel-grid">
          <Panel title="Consommation & pics" sub="volume hebdomadaire · 12 mois" span right={<span className="peak-tag"><span className="peak-dot" />pic S45</span>}>
            {testZero ? <Empty /> : <LineChart data={D.consumption} labelEvery={2} />}
          </Panel>
          <Panel title="Enveloppe de tokens" sub="consommé vs contracté">
            {testZero ? <Empty /> : <Gauge used={D.quota.used} total={D.quota.total} projection={D.quota.projection} />}
          </Panel>
        </div>
      </div>
    </React.Fragment>);
}
function Empty() { return <div className="panel-empty"><Ico name="activity" size={20} /><span>Aucune donnée en mode test</span></div>; }

/* ----------------------------- Stats / Reporting ----------------------------- */
function StatChip({ icon, label, value, on, onClick }) {
  return <button className={"stat-chip" + (on ? " on" : "")} onClick={onClick}><Ico name={icon} size={14} sw={1.8} />{label}{value && <b>{value}</b>}</button>;
}
export function ConsoleStats({ onNav }) {
  const [groupBy, setGroupBy] = React.useState("country");
  const [compare, setCompare] = React.useState(true);
  const [period, setPeriod] = React.useState("30 j");
  const D = CONSOLE_DATA;
  const groups = [
    { id: "country", nm: "Pays" }, { id: "doc", nm: "Document" }, { id: "device", nm: "Device" }, { id: "method", nm: "Méthode" }, { id: "workflow", nm: "Workflow" },
  ];
  const byGroupData = { country: D.countries, doc: D.docs, device: D.platforms, method: D.mix.map((m) => ({ k: m.k, v: m.v })), workflow: [{ k: "Onboarding KYC particuliers", v: 31200 }, { k: "Réauthentification wallet", v: 9800 }, { k: "Onboarding sinistres", v: 5100 }, { k: "Vérification vendeur", v: 2820 }] }[groupBy];
  const aiTime = [{ k: "< 30 s", v: 61, color: "var(--color-main)" }, { k: "30–45 s", v: 24, color: "#7E97E8" }, { k: "45–60 s", v: 10, color: "#C2D0F4" }, { k: "> 60 s", v: 5, color: "#E4E9F8" }];
  const usage = [{ k: "Jan", v: 38200 }, { k: "Fév", v: 40100 }, { k: "Mar", v: 42600 }, { k: "Avr", v: 44900 }, { k: "Mai", v: 47100 }, { k: "Juin", v: 48920 }];
  return (
    <React.Fragment>
      <div className="dash-topbar">
        <div className="dt-head"><div className="eyebrow">Console</div><h1>Statistiques</h1></div>
        <div className="topbar-controls">
          <button className="sid-btn outline sm-btn"><Ico name="book" size={14} sw={1.8} />Vues sauvegardées</button>
          <button className="sid-btn inverse sm-btn"><Ico name="share" size={13} sw={1.8} />Export CSV</button>
        </div>
      </div>
      <div className="dash-body console-body">
        <div className="stats-controls">
          <PeriodSeg value={period} onChange={setPeriod} options={["7 j", "30 j", "90 j", "Custom"]} />
          <div className="ctrl-div" />
          <span className="ctrl-lab">Segmenter par</span>
          {groups.map((g) => <StatChip key={g.id} icon="layers" label={g.nm} on={groupBy === g.id} onClick={() => setGroupBy(g.id)} />)}
          <div className="ctrl-div" />
          <StatChip icon="activity" label="Comparer N-1" on={compare} onClick={() => setCompare(!compare)} />
        </div>

        <div className="panel-grid">
          <Panel title={"Usage par " + (groups.find((g) => g.id === groupBy).nm.toLowerCase())} sub={compare ? "vs période précédente" : "période courante"} span right={<span className="drill-hint"><Ico name="search" size={12} sw={1.8} />cliquez pour drill-down</span>}>
            <div className="drill-bars">
              {byGroupData.map((d, i) => {
                const max = Math.max(...byGroupData.map((x) => x.v));
                return (
                  <button className="drill-row" key={i} onClick={() => onNav && onNav("requests")}>
                    <span className="drill-name">{d.flag ? d.flag + " " : ""}{d.k}</span>
                    <div className="drill-track"><div className="drill-bar" style={{ width: d.v / max * 100 + "%" }} />{compare && <div className="drill-bar prev" style={{ width: d.v / max * 88 + "%" }} />}</div>
                    <span className="drill-val">{fmtFull(d.v)}</span>
                  </button>);
              })}
            </div>
          </Panel>
          <Panel title="Performance — temps IA" sub="par tranche de traitement">
            <Donut data={aiTime} center={{ v: "34 s", l: "médiane" }} />
          </Panel>
        </div>

        <div className="panel-grid">
          <Panel title="Usage mensuel" sub="flows completed · 6 mois" span>
            <LineChart data={usage} peak={false} />
          </Panel>
          <Panel title="First time right" sub="taux de complétion">
            <div className="ftr">
              <div className="ftr-big">82,3 %</div>
              <Sparkline data={[74, 76, 78, 77, 80, 81, 82]} w={160} h={44} />
              <div className="ftr-sub">users ayant terminé l'étape SDK ÷ démarrés</div>
            </div>
          </Panel>
        </div>

        <Panel title="Your contract — real use" sub="consommation vs package par produit" span>
          <div className="contract-rows">
            {[{ k: "Onboarding", used: 6.4, total: 8 }, { k: "Authentification", used: 0.94, total: 2 }].map((c, i) =>
              <div className="contract-row" key={i}>
                <span className="contract-name">{c.k}</span>
                <div className="contract-track"><div className="contract-bar" style={{ width: c.used / c.total * 100 + "%" }} /></div>
                <span className="contract-val">{c.used} M / {c.total} M</span>
              </div>)}
          </div>
        </Panel>
      </div>
    </React.Fragment>);
}
