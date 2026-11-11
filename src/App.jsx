import { useState } from 'react'
import machines from './machines.json'
import './App.css'

const dailyProduction = [
  { day: 'Lun', total: 980 },
  { day: 'Mar', total: 1120 },
  { day: 'Mer', total: 1050 },
  { day: 'Jeu', total: 1280 },
  { day: 'Ven', total: 1160 },
  { day: 'Sam', total: 890 },
  { day: 'Dim', total: 1248 },
]

const statusLabels = {
  running: 'En fonctionnement',
  stopped: 'À l’arrêt',
  failure: 'En panne',
}

function App() {
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchName, setSearchName] = useState('')

  const zones = [...new Set(machines.map((machine) => machine.zone))].sort()
  const normalizedSearch = searchName.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr')
  const filteredMachines = machines.filter((machine) => (
    (selectedZone === 'all' || machine.zone === selectedZone)
    && (selectedStatus === 'all' || machine.status === selectedStatus)
    && machine.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').includes(normalizedSearch)
  ))

  const counts = {
    total: machines.length,
    running: machines.filter((machine) => machine.status === 'running').length,
    stopped: machines.filter((machine) => machine.status === 'stopped').length,
    failure: machines.filter((machine) => machine.status === 'failure').length,
  }

  const indicators = [
    { key: 'total', label: 'Total des machines', value: counts.total, icon: '▦', tone: 'violet' },
    { key: 'running', label: 'En fonctionnement', value: counts.running, icon: '↗', tone: 'green' },
    { key: 'stopped', label: 'À l’arrêt', value: counts.stopped, icon: 'Ⅱ', tone: 'amber' },
    { key: 'failure', label: 'En panne', value: counts.failure, icon: '!', tone: 'red' },
  ]
  const todayProduction = dailyProduction[dailyProduction.length - 1]
  const maxDailyProduction = Math.max(...dailyProduction.map((day) => day.total))

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/" aria-label="FactoryPlus, accueil">
          <span className="brand-mark">F</span>
          <span>Factory<span className="brand-light">Plus</span></span>
        </a>
        <span className="demo-badge"><span /> Données de démonstration</span>
      </header>

      <section className="dashboard-content" aria-labelledby="dashboard-title">
        <div className="page-heading">
          <div>
            <p className="eyebrow">VOTRE USINE EN UN COUP D’ŒIL</p>
            <h1 id="dashboard-title">Tableau de bord</h1>
            <p className="subtitle">Suivez l’état de vos équipements en temps réel.</p>
          </div>
          <div className="updated-label"><span className="live-dot" /> Vue d’ensemble</div>
        </div>

        <section className="kpi-grid" aria-label="Indicateurs clés des machines">
          {indicators.map((indicator) => (
            <article className="kpi-card" key={indicator.key}>
              <div className={`kpi-icon ${indicator.tone}`} aria-hidden="true">
                {indicator.icon}
              </div>
              <p className="kpi-label">{indicator.label}</p>
              <p className="kpi-value">{indicator.value}</p>
              <p className="kpi-caption">
                {indicator.key === 'total' ? 'équipements enregistrés' : 'machines'}
              </p>
            </article>
          ))}
        </section>

        <section className="production-section" aria-labelledby="production-title">
          <div className="production-summary">
            <div className="production-heading">
              <p className="eyebrow">PRODUCTION</p>
              <h2 id="production-title">Production journalière</h2>
              <p>Quantité totale produite cette semaine.</p>
            </div>
            <div className="production-today">
              <span className="production-today-label">Aujourd’hui · {todayProduction.day}</span>
              <strong>{todayProduction.total.toLocaleString('fr-FR')}</strong>
              <span className="production-unit">unités produites</span>
            </div>
          </div>
          <div
            className="production-chart"
            role="img"
            aria-label={`Production hebdomadaire en unités : ${dailyProduction.map(({ day, total }) => `${day}, ${total}`).join('; ')}`}
          >
            {dailyProduction.map(({ day, total }) => (
              <div className="production-day" key={day}>
                <span className="production-bar-value">{total.toLocaleString('fr-FR')}</span>
                <div className="production-bar-track">
                  <div
                    className={`production-bar${day === todayProduction.day ? ' today' : ''}`}
                    style={{ height: `${(total / maxDailyProduction) * 100}%` }}
                  />
                </div>
                <span className="production-day-label">{day}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="machine-section" aria-labelledby="machines-title">
          <div className="section-heading">
            <div>
              <h2 id="machines-title">État des machines</h2>
              <p>Consultez le statut actuel de chaque équipement.</p>
            </div>
            <span className="machine-count">
              {filteredMachines.length} / {machines.length} machines
            </span>
          </div>
          <div className="machine-filters" aria-label="Filtres des machines">
            <label className="filter-field search-field">
              <span>Rechercher une machine</span>
              <input
                type="search"
                value={searchName}
                onChange={(event) => setSearchName(event.target.value)}
                placeholder="Nom de l’équipement"
              />
            </label>
            <label className="filter-field">
              <span>Zone</span>
              <select value={selectedZone} onChange={(event) => setSelectedZone(event.target.value)}>
                <option value="all">Toutes les zones</option>
                {zones.map((zone) => <option value={zone} key={zone}>{zone}</option>)}
              </select>
            </label>
            <label className="filter-field">
              <span>Statut</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)}>
                <option value="all">Tous les statuts</option>
                {Object.entries(statusLabels).map(([status, label]) => (
                  <option value={status} key={status}>{label}</option>
                ))}
              </select>
            </label>
            {(searchName || selectedZone !== 'all' || selectedStatus !== 'all') && (
              <button
                className="filter-reset"
                type="button"
                onClick={() => {
                  setSearchName('')
                  setSelectedZone('all')
                  setSelectedStatus('all')
                }}
              >
                Réinitialiser
              </button>
            )}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Machine</th>
                  <th scope="col">Zone</th>
                  <th scope="col">Emplacement</th>
                  <th scope="col">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine) => (
                  <tr key={machine.id}>
                    <td>
                      <span className="machine-name">{machine.name}</span>
                      <span className="machine-id">{machine.id}</span>
                    </td>
                    <td>{machine.zone}</td>
                    <td>{machine.location}</td>
                    <td>
                      <span className={`status-pill ${machine.status}`}>
                        <span className="status-dot" />
                        {statusLabels[machine.status]}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredMachines.length === 0 && (
                  <tr>
                    <td className="empty-machines" colSpan="4">
                      Aucune machine ne correspond à votre recherche et à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <p className="data-note">La liste des machines est chargée depuis <code>src/machines.json</code>. Remplacez les exemples par vos données.</p>
      </section>
    </main>
  )
}

export default App
