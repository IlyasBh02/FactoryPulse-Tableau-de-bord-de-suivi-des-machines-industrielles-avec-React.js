import './App.css'

const machines = [
  { id: 'MCH-001', name: 'Presse hydraulique', location: 'Atelier A', status: 'running' },
  { id: 'MCH-002', name: 'Tour CNC', location: 'Atelier A', status: 'running' },
  { id: 'MCH-003', name: 'Convoyeur principal', location: 'Atelier B', status: 'stopped' },
  { id: 'MCH-004', name: 'Robot d’assemblage', location: 'Atelier B', status: 'running' },
  { id: 'MCH-005', name: 'Compresseur', location: 'Salle technique', status: 'failure' },
  { id: 'MCH-006', name: 'Découpe laser', location: 'Atelier A', status: 'running' },
  { id: 'MCH-007', name: 'Fraiseuse CNC', location: 'Atelier C', status: 'stopped' },
  { id: 'MCH-008', name: 'Pompe de refroidissement', location: 'Atelier C', status: 'running' },
]

const statusLabels = {
  running: 'En fonctionnement',
  stopped: 'À l’arrêt',
  failure: 'En panne',
}

function App() {
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

        <section className="machine-section" aria-labelledby="machines-title">
          <div className="section-heading">
            <div>
              <h2 id="machines-title">État des machines</h2>
              <p>Consultez le statut actuel de chaque équipement.</p>
            </div>
            <span className="machine-count">{machines.length} machines</span>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th scope="col">Machine</th>
                  <th scope="col">Emplacement</th>
                  <th scope="col">Statut</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine.id}>
                    <td>
                      <span className="machine-name">{machine.name}</span>
                      <span className="machine-id">{machine.id}</span>
                    </td>
                    <td>{machine.location}</td>
                    <td>
                      <span className={`status-pill ${machine.status}`}>
                        <span className="status-dot" />
                        {statusLabels[machine.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <p className="data-note">Les chiffres affichés sont des exemples. Remplacez la liste de démonstration par les données de vos machines.</p>
      </section>
    </main>
  )
}

export default App
