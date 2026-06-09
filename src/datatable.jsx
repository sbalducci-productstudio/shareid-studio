/* ShareID Studio — datatable.jsx
   Tableau de données réutilisable : recherche libre, tri par colonne, filtres
   par colonne (texte « contient » / multi-sélection), personnalisation des
   colonnes affichées, pagination. Sans logique métier — entièrement piloté par
   une description de colonnes. Partagé par la vue Utilisateurs (admin.jsx) et la
   vue Organisations (org.jsx) pour garantir une structure d'écran identique.

   Le périmètre d'accès (qui a le droit de voir quelles lignes) se résout EN AMONT
   par l'appelant : on ne passe ici que les lignes déjà autorisées. */
import React from "react";
import { Ico } from "./core.jsx";

const PAGE_SIZES = [10, 25, 50];

/* Description d'une colonne :
   { id, h, kind: "text" | "cat" | "none",
     get(row)         → valeur brute (clé de filtre/comparaison),
     cell?(row)       → JSX d'affichage (défaut : get(row)),
     label?(v)        → mise en forme d'une valeur catégorielle (options + chips),
     sortable?        → active le tri sur l'en-tête,
     sortAccessor?(r) → valeur de tri si différente de get (ex. nombre),
     lock?            → colonne non masquable }
   `kind` pilote le filtre : text = input « contient » · cat = multi-sélection de
   valeurs distinctes dérivées des lignes · none = pas de filtre. */
export function DataTable({ rows, cols, searchPlaceholder = "Rechercher…", searchGet, onRowClick, rowKey, emptyLabel = "Aucun résultat.", defaultPageSize = 25 }) {
  const [q, setQ] = React.useState("");
  const [filters, setFilters] = React.useState({}); // { colId: "texte" } | { colId: [valeurs] }
  const [openFilter, setOpenFilter] = React.useState(null); // colonne dont le popover est ouvert
  const [visible, setVisible] = React.useState(() => cols.map((c) => c.id)); // colonnes affichées
  const [colMenu, setColMenu] = React.useState(false);
  const [sort, setSort] = React.useState(null); // { id, dir: 1 | -1 }
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [page, setPage] = React.useState(0);

  // Fermeture des popovers (filtre colonne / menu colonnes) au clic extérieur.
  React.useEffect(() => {
    if (!openFilter && !colMenu) return;
    function onDoc() { setOpenFilter(null); setColMenu(false); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, [openFilter, colMenu]);

  // Options des filtres catégoriels = valeurs distinctes présentes dans les lignes.
  const catOptions = React.useMemo(() => {
    const o = {};
    cols.filter((c) => c.kind === "cat").forEach((c) => {
      o[c.id] = Array.from(new Set(rows.map((r) => c.get(r)))).filter((v) => v != null && v !== "").sort();
    });
    return o;
  }, [rows, cols]);

  const ql = q.trim().toLowerCase();
  function matchFilters(r) {
    for (const c of cols) {
      const f = filters[c.id];
      if (f == null || (Array.isArray(f) && f.length === 0) || f === "") continue;
      if (c.kind === "text" && !String(c.get(r) ?? "").toLowerCase().includes(String(f).toLowerCase())) return false;
      if (c.kind === "cat" && !f.includes(c.get(r))) return false;
    }
    return true;
  }
  let out = rows.filter((r) => {
    const hay = searchGet ? searchGet(r) : cols.filter((c) => c.kind !== "none").map((c) => c.get(r)).join(" ");
    return (ql === "" || String(hay).toLowerCase().includes(ql)) && matchFilters(r);
  });
  if (sort) {
    const col = cols.find((c) => c.id === sort.id);
    const acc = col && (col.sortAccessor || col.get);
    if (acc) out = [...out].sort((a, b) => {
      const va = acc(a), vb = acc(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sort.dir;
      return String(va).localeCompare(String(vb), "fr", { numeric: true }) * sort.dir;
    });
  }

  // Pagination : page courante clampée au nombre de pages disponibles.
  const totalPages = Math.max(1, Math.ceil(out.length / pageSize));
  const curPage = Math.min(page, totalPages - 1);
  const pageRows = out.slice(curPage * pageSize, curPage * pageSize + pageSize);
  const firstRow = out.length === 0 ? 0 : curPage * pageSize + 1;
  const lastRow = Math.min(out.length, (curPage + 1) * pageSize);

  // Toute mutation de filtre / recherche ramène à la première page.
  function setColFilter(id, val) { setFilters((f) => ({ ...f, [id]: val })); setPage(0); }
  function clearColFilter(id) { setFilters((f) => { const n = { ...f }; delete n[id]; return n; }); setPage(0); }
  function clearAll() { setFilters({}); setQ(""); setPage(0); }
  function toggleCol(id) { setVisible((v) => v.includes(id) ? v.filter((x) => x !== id) : cols.filter((c) => v.includes(c.id) || c.id === id).map((c) => c.id)); }
  function toggleSort(id) { setSort((s) => !s || s.id !== id ? { id, dir: 1 } : s.dir === 1 ? { id, dir: -1 } : null); }
  function activeCount(c) { const f = filters[c.id]; return Array.isArray(f) ? f.length : (f ? 1 : 0); }

  const visCols = cols.filter((c) => visible.includes(c.id));
  // Chips récapitulatifs des filtres actifs (hiérarchise l'info de recherche).
  const chips = cols.filter((c) => activeCount(c) > 0).map((c) => {
    const f = filters[c.id];
    const txt = c.kind === "cat" ? f.map((v) => (c.label ? c.label(v) : v)).join(", ") : `« ${f} »`;
    return { id: c.id, label: `${c.h} : ${txt}` };
  });

  return (
    <React.Fragment>
      {/* Barre d'outils : recherche proéminente (texte intégral lisible) + menu Colonnes. */}
      <div className="filter-row users-toolbar" onClick={(e) => e.stopPropagation()}>
        <div className="input-wrap users-search">
          <span className="ico"><Ico name="search" size={16} /></span>
          <input className="inp with-icon" value={q} placeholder={searchPlaceholder} onChange={(e) => { setQ(e.target.value); setPage(0); }} />
          {q && <button className="inp-clear" onClick={() => { setQ(""); setPage(0); }} aria-label="Effacer"><Ico name="x" size={14} sw={2.2} /></button>}
        </div>
        <div style={{ position: "relative" }}>
          <button className={"filter-chip" + (colMenu ? " on" : "")} onClick={() => { setColMenu((v) => !v); setOpenFilter(null); }}><Ico name="rows" size={13} sw={1.8} />Colonnes</button>
          {colMenu &&
            <div className="combo-pop" style={{ right: 0, left: "auto", minWidth: 200 }}>
              {cols.map((c) => {
                const on = visible.includes(c.id);
                return (
                  <button key={c.id} className="combo-opt" disabled={c.lock} onClick={() => toggleCol(c.id)}>
                    <span className="mark sq" style={on ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={11} sw={3} style={{ opacity: on ? 1 : 0 }} /></span>
                    {c.h}{c.lock && <span className="ctrl-lab" style={{ marginLeft: "auto" }}>fixe</span>}
                  </button>);
              })}
            </div>}
        </div>
      </div>

      {/* Récap des filtres actifs — chips supprimables + tout effacer. */}
      {(chips.length > 0 || ql !== "") &&
        <div className="active-filters">
          <span className="ctrl-lab">Filtres actifs</span>
          {ql !== "" && <span className="af-chip">Recherche : « {q} »<button onClick={() => { setQ(""); setPage(0); }}><Ico name="x" size={11} sw={2.4} /></button></span>}
          {chips.map((ch) => <span key={ch.id} className="af-chip">{ch.label}<button onClick={() => clearColFilter(ch.id)}><Ico name="x" size={11} sw={2.4} /></button></span>)}
          <button className="af-clear" onClick={clearAll}>Tout effacer</button>
        </div>}

      <div className="wf-table-wrap users-table-wrap">
        <div className="wf-table-scroll">
          <table className="wf-table">
            <thead><tr>{visCols.map((c) => {
              const n = activeCount(c);
              const sorted = sort && sort.id === c.id;
              return (
                <th key={c.id} className={n > 0 ? "th-filtered" : ""}>
                  {c.kind === "none" && !c.sortable ? c.h :
                    <span className="th-head" onClick={(e) => e.stopPropagation()}>
                      {c.sortable
                        ? <button className={"th-sort" + (sorted ? " on" : "")} onClick={() => toggleSort(c.id)}>{c.h}<Ico name={sorted && sort.dir === -1 ? "chevDown" : "chevUp"} size={12} sw={2} style={sorted ? null : { opacity: .3 }} /></button>
                        : <span>{c.h}</span>}
                      {c.kind !== "none" &&
                        <button className={"th-filter" + (n > 0 ? " on" : "")} onClick={() => setOpenFilter((o) => o === c.id ? null : c.id)}>
                          <Ico name="filter" size={12} sw={1.8} />{n > 0 && <span className="th-filter-n">{n}</span>}
                        </button>}
                      {openFilter === c.id &&
                        <div className="combo-pop th-pop">
                          {c.kind === "text" ?
                            <div className="th-pop-text">
                              <input className="inp sm" autoFocus value={filters[c.id] || ""} placeholder={"Filtrer « " + c.h + " »…"} onChange={(e) => setColFilter(c.id, e.target.value)} />
                              {filters[c.id] && <button className="combo-opt th-reset" onClick={() => clearColFilter(c.id)}>Effacer ce filtre</button>}
                            </div> :
                            <React.Fragment>
                              {(catOptions[c.id] || []).map((v) => {
                                const arr = filters[c.id] || [];
                                const on = arr.includes(v);
                                return (
                                  <button key={v} className="combo-opt" onClick={() => setColFilter(c.id, on ? arr.filter((x) => x !== v) : [...arr, v])}>
                                    <span className="mark sq" style={on ? { borderColor: "var(--color-main)", background: "var(--color-main)" } : null}><Ico name="check" size={11} sw={3} style={{ opacity: on ? 1 : 0 }} /></span>
                                    {c.label ? c.label(v) : v}
                                  </button>);
                              })}
                              {n > 0 && <button className="combo-opt th-reset" onClick={() => clearColFilter(c.id)}>Tout désélectionner</button>}
                            </React.Fragment>}
                        </div>}
                    </span>}
                </th>);
            })}</tr></thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={rowKey(r)} className="wf-row" onClick={() => onRowClick && onRowClick(r)}>
                  {visCols.map((c) => <td key={c.id}>{c.cell ? c.cell(r) : c.get(r)}</td>)}
                </tr>))}
              {pageRows.length === 0 &&
                <tr><td colSpan={visCols.length}><div className="panel-empty" style={{ padding: "26px 12px" }}><Ico name="search" size={18} /><span>{emptyLabel}</span></div></td></tr>}
            </tbody>
          </table>
        </div>
        {/* Pied de table : comptage + taille de page + navigation. */}
        <div className="table-foot">
          <span className="foot-count">{out.length === 0 ? "0 résultat" : `${firstRow}–${lastRow} sur ${out.length}`}</span>
          <div className="foot-pager">
            <span className="ctrl-lab">Lignes</span>
            <select className="foot-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}>
              {PAGE_SIZES.map((nn) => <option key={nn} value={nn}>{nn}</option>)}
            </select>
            <div className="ctrl-div" />
            <button className="page-btn" disabled={curPage === 0} onClick={() => setPage(curPage - 1)} aria-label="Page précédente"><Ico name="chevL" size={15} sw={2} /></button>
            <span className="foot-pages">Page {curPage + 1} / {totalPages}</span>
            <button className="page-btn" disabled={curPage >= totalPages - 1} onClick={() => setPage(curPage + 1)} aria-label="Page suivante"><Ico name="chevR" size={15} sw={2} /></button>
          </div>
        </div>
      </div>
    </React.Fragment>);
}
