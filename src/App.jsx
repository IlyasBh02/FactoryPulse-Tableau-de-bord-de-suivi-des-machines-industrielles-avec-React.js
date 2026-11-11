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
        <p className="data-note">La liste des machines est chargée depuis <code>src/machines.json</code>. Remplacez les exemples par vos données.</p>
      </section>
    </main>
  )
}

export default App
