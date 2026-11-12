import { useState } from 'react'
import seedMachines from './machines.json'
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

const addedMachinesStorageKey = 'factoryplus-added-machines'

function isValidAddedMachine(machine) {
  return machine
    && typeof machine.id === 'string'
    && typeof machine.name === 'string'
    && typeof machine.zone === 'string'
    && typeof machine.location === 'string'
    && Object.hasOwn(statusLabels, machine.status)
    && Number.isFinite(machine.production)
    && typeof machine.lastMaintenance === 'string'
}

function loadSavedMachines() {
  try {
    const savedMachines = window.localStorage.getItem(addedMachinesStorageKey)
    if (savedMachines === null) return { machines: [], message: '' }

    const parsedMachines = JSON.parse(savedMachines)
    if (!Array.isArray(parsedMachines) || !parsedMachines.every(isValidAddedMachine)) {
      throw new Error('Les données enregistrées ne sont pas valides.')
    }

    return { machines: parsedMachines, message: '' }
  } catch {
    return {
      machines: [],
      message: 'Les machines enregistrées n’ont pas pu être chargées. Vous pouvez continuer à utiliser le tableau de bord.',
    }
  }
}

function AddMachinePage({ onCancel, onAdd }) {
  return (
    <section className="dashboard-content form-content" aria-labelledby="add-machine-title">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTION DU PARC</p>
          <h1 id="add-machine-title">Ajouter une machine</h1>
          <p className="subtitle">Renseignez les informations du nouvel équipement.</p>
        </div>
      </div>

      <form className="machine-form" onSubmit={onAdd}>
        <label className="form-field">
          <span>Nom de l’équipement</span>
          <input name="name" type="text" maxLength="80" placeholder="Ex. Presse hydraulique" required />
        </label>
        <label className="form-field">
          <span>Zone</span>
          <input name="zone" type="text" maxLength="40" placeholder="Ex. Zone A" required />
        </label>
        <label className="form-field">
          <span>Statut initial</span>
          <select name="status" defaultValue="running" required>
            {Object.entries(statusLabels).map(([status, label]) => (
              <option value={status} key={status}>{label}</option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Production (unités)</span>
          <input name="production" type="number" min="0" step="1" defaultValue="0" required />
        </label>
        <label className="form-field">
          <span>Date de dernière maintenance</span>
          <input name="lastMaintenance" type="date" required />
        </label>
        <div className="form-actions">
          <button className="form-cancel" type="button" onClick={onCancel}>Annuler</button>
          <button className="form-submit" type="submit">Ajouter la machine</button>
        </div>
      </form>
      <p className="data-note">Les nouvelles machines sont enregistrées dans ce navigateur.</p>
    </section>
  )
}

function App() {
  const [savedState, setSavedState] = useState(loadSavedMachines)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchName, setSearchName] = useState('')

  const { machines: addedMachines, message: storageMessage } = savedState
  const machines = [...seedMachines, ...addedMachines]
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

  function handleAddMachine(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextNumber = machines.reduce((maximum, machine) => (
      Math.max(maximum, Number(machine.id.match(/\d+$/)?.[0] ?? 0))
    ), 0) + 1
    const newMachine = {
      id: `MCH-${String(nextNumber).padStart(3, '0')}`,
      name: String(formData.get('name')).trim(),
      zone: String(formData.get('zone')).trim(),
      location: '—',
      status: String(formData.get('status')),
      production: Number(formData.get('production')),
      lastMaintenance: String(formData.get('lastMaintenance')),
    }
    const nextAddedMachines = [...addedMachines, newMachine]
    let message = ''
    try {
      window.localStorage.setItem(addedMachinesStorageKey, JSON.stringify(nextAddedMachines))
    } catch {
      message = 'Machine ajoutée pour cette session, mais impossible de la conserver après actualisation.'
    }
    setSavedState({ machines: nextAddedMachines, message })
    setSelectedZone('all')
    setSelectedStatus('all')
    setSearchName('')
    setCurrentPage('dashboard')
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="/" aria-label="FactoryPlus, accueil">
          <span className="brand-mark">F</span>
          <span>Factory<span className="brand-light">Plus</span></span>
        </a>
        <div className="topbar-actions">
          <span className="demo-badge"><span /> Données de démonstration</span>
          <button
            className="add-machine-button"
            type="button"
            onClick={() => setCurrentPage(currentPage === 'add' ? 'dashboard' : 'add')}
          >
            {currentPage === 'add' ? 'Retour au tableau' : '+ Ajouter une machine'}
          </button>
        </div>
      </header>

      {currentPage === 'add' ? (
        <AddMachinePage
          onCancel={() => setCurrentPage('dashboard')}
          onAdd={handleAddMachine}
        />
      ) : (
      <section className="dashboard-content" aria-labelledby="dashboard-title">
        {storageMessage && <p className="storage-message" role="status">{storageMessage}</p>}
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
                  <th scope="col">Production</th>
                  <th scope="col">Dernière maintenance</th>
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
                    <td>{machine.production == null ? '—' : `${machine.production.toLocaleString('fr-FR')} unités`}</td>
                    <td>
                      {machine.lastMaintenance
                        ? new Date(`${machine.lastMaintenance}T00:00:00`).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                  </tr>
                ))}
                {filteredMachines.length === 0 && (
                  <tr>
                    <td className="empty-machines" colSpan="6">
                      Aucune machine ne correspond à votre recherche et à vos filtres.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        <p className="data-note">Les machines de démonstration viennent de <code>src/machines.json</code>. Les nouvelles machines sont conservées dans ce navigateur.</p>
      </section>
      )}
    </main>
  )
}

export default App
