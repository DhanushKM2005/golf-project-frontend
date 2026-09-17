import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { api } from '../api/client.js'

export default function Landing() {
  const [charities, setCharities] = useState([])

  useEffect(() => {
    api.charities().then((data) => setCharities((data.results || data).slice(0, 3))).catch(() => {})
  }, [])

  return (
    <div className="container">
      <nav className="nav">
        <div className="brand">digital<em>heroes</em></div>
        <div className="nav-links">
          <Link to="/login">Log in</Link>
          <Link to="/register" className="btn btn-primary btn-small">Join now</Link>
        </div>
      </nav>

      <section className="hero">
        <div>
          <h1>Play your round.<br/>Fund someone's cause.</h1>
          <p className="lede">
            Log your last five Stableford scores, get entered into this month's
            draw, and send part of every subscription straight to a charity you choose.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">Start subscribing</Link>
            <a href="#how" className="btn btn-secondary">How it works</a>
          </div>
        </div>
        <div className="hero-figure">
          <div className="stat-row">
            <div>
              <div className="stat">10%+</div>
              <div className="stat-label">of every subscription goes to your chosen charity</div>
            </div>
            <div>
              <div className="stat">5 / 4 / 3</div>
              <div className="stat-label">number matches share this month's prize pool</div>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works" id="how">
        <div className="how-step">
          <span className="n">01</span>
          <h3>Subscribe</h3>
          <p>Pick monthly or yearly and choose a charity to support.</p>
        </div>
        <div className="how-step">
          <span className="n">02</span>
          <h3>Log scores</h3>
          <p>Enter your last five rounds — your numbers double as your draw ticket.</p>
        </div>
        <div className="how-step">
          <span className="n">03</span>
          <h3>Get drawn</h3>
          <p>Every month, five numbers are drawn. Match 3, 4, or 5 to win.</p>
        </div>
        <div className="how-step">
          <span className="n">04</span>
          <h3>Give back</h3>
          <p>Meanwhile, your subscription keeps funding your charity, win or not.</p>
        </div>
      </section>

      {charities.length > 0 && (
        <section className="charity-strip">
          <h2>Causes on the platform</h2>
          <div className="charity-grid">
            {charities.map((c) => (
              <div className="charity-card" key={c.id}>
                <h4>{c.name}</h4>
                <p>{c.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
