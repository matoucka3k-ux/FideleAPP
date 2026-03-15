import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import styles from './Welcome.module.css'

export default function Welcome() {
  const navigate = useNavigate()
  const { user, commercant } = useAuth()
  const [articles, setArticles] = useState([
    { nom: 'Baguette', points: 5 },
    { nom: 'Viennoiserie', points: 10 },
  ])
  const [rewards, setRewards] = useState([
    { nom: 'Café offert', points_requis: 50 },
    { nom: 'Viennoiserie offerte', points_requis: 100 },
  ])
  const [bonus, setBonus] = useState(50)
  const [loading, setLoading] = useState(false)

  const addArticle = () => setArticles(a => [...a, { nom: '', points: 10 }])
  const updateArticle = (i, f, v) => setArticles(a => a.map((x, idx) => idx === i ? { ...x, [f]: v } : x))
  const delArticle = (i) => setArticles(a => a.filter((_, idx) => idx !== i))

  const addReward = () => setRewards(r => [...r, { nom: '', points_requis: 100 }])
  const updateReward = (i, f, v) => setRewards(r => r.map((x, idx) => idx === i ? { ...x, [f]: v } : x))

  const handleFinish = async () => {
    setLoading(true)
    try {
      const uid = user?.id
      if (uid) {
        await supabase.from('commercants').update({ bonus_bienvenue: bonus }).eq('id', uid)

        const validArticles = articles.filter(a => a.nom.trim())
        if (validArticles.length > 0) {
          await supabase.from('categories').insert(
            validArticles.map(a => ({
              commercant_id: uid,
              nom: a.nom,
              points_par_euro: a.points,
              actif: true
            }))
          )
        }

        const validRewards = rewards.filter(r => r.nom.trim())
        if (validRewards.length > 0) {
          await supabase.from('recompenses').insert(
            validRewards.map(r => ({
              commercant_id: uid,
              nom: r.nom,
              points_requis: r.points_requis
            }))
          )
        }
      }
      navigate('/dashboard')
    } catch (e) {
      console.error(e)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const nomCommerce = commercant?.nom_commerce || 'votre commerce'
  const prenom = commercant?.nom_complet?.split(' ')[0] || ''

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>
            <svg viewBox="0 0 16 16" fill="none" stroke="#fff" strokeWidth="2"><path d="M8 2C5 2 3 4 3 6.5c0 3.5 5 7.5 5 7.5s5-4 5-7.5C13 4 11 2 8 2z"/></svg>
          </div>
          FidèleApp
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.inner}>
          <div className={styles.doneBadge}>
            <svg viewBox="0 0 12 12" fill="none" stroke="#16A34A" strokeWidth="2.5"><path d="M2 6l3 3 5-5"/></svg>
            Compte créé avec succès
          </div>
          <h1 className={styles.title}>
            {prenom ? `Bienvenue ${prenom},` : 'Bienvenue,'}<br />
            votre programme est <span>prêt.</span>
          </h1>
          <p className={styles.sub}>
            Configurez vos articles et récompenses en 2 minutes. Vous pourrez tout modifier depuis votre tableau de bord.
          </p>

          <div className={styles.etapes}>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eDone}`}>
                <svg viewBox="0 0 12 12" fill="none" stroke="#16A34A" strokeWidth="2.5" style={{width:12,height:12}}><path d="M2 6l3 3 5-5"/></svg>
              </div>
              <div className={styles.eBody}>
                <div className={styles.eLabel}>Compte créé</div>
                <div className={styles.eDesc}>{nomCommerce} · {commercant?.email || ''}</div>
              </div>
              <span className={`${styles.eTag} ${styles.tDone}`}>Fait</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eNow}`}>2</div>
              <div className={styles.eBody}>
                <div className={styles.eLabel}>Configurer vos points</div>
                <div className={styles.eDesc}>Définissez vos articles et ce que gagnent vos clients</div>
              </div>
              <span className={`${styles.eTag} ${styles.tNow}`}>Maintenant</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eLater}`}>3</div>
              <div className={styles.eBody}>
                <div className={`${styles.eLabel} ${styles.dim}`}>Imprimer votre QR code</div>
                <div className={styles.eDesc}>À poser sur votre comptoir pour les inscriptions</div>
              </div>
              <span className={`${styles.eTag} ${styles.tLater}`}>Plus tard</span>
            </div>
            <div className={styles.etape}>
              <div className={`${styles.eNum} ${styles.eLater}`}>4</div>
              <div className={styles.eBody}>
                <div className={`${styles.eLabel} ${styles.dim}`}>Premier encaissement</div>
                <div className={styles.eDesc}>Scanner le QR code d'un client et créditer ses points</div>
              </div>
              <span className={`${styles.eTag} ${styles.tLater}`}>Plus tard</span>
            </div>
          </div>

          <div className={styles.configCard}>
            <div className={styles.configTitle}>Configuration rapide</div>
            <div className={styles.configSub}>Vous pourrez tout affiner dans "Système de points"</div>

            {/* BONUS */}
            <div className={styles.cLabel}>Bonus de bienvenue</div>
            <div className={styles.cInput} style={{marginBottom: 20}}>
              <input type="number" value={bonus} min="0" onChange={e => setBonus(+e.target.value)} />
              <span>points offerts à l'inscription</span>
            </div>

            {/* ARTICLES */}
            <div className={styles.cLabel}>Articles & points gagnés</div>
            <div style={{fontSize: 12, color: '#94A3B8', marginBottom: 10}}>Ex : Baguette = 5 pts · Coupe femme = 50 pts</div>
            <div className={styles.rewardsList} style={{marginBottom: 8}}>
              {articles.map((a, i) => (
                <div key={i} className={styles.rewardRow}>
                  <input
                    type="text"
                    value={a.nom}
                    placeholder="Nom de l'article"
                    onChange={e => updateArticle(i, 'nom', e.target.value)}
                  />
                  <span className={styles.sep}>=</span>
                  <input
                    type="number"
                    value={a.points}
                    min="1"
                    onChange={e => updateArticle(i, 'points', +e.target.value)}
                  />
                  <span className={styles.unit}>pts</span>
                  {articles.length > 1 && (
                    <button onClick={() => delArticle(i)} style={{border:'none',background:'none',cursor:'pointer',color:'#CBD5E1',fontSize:14,fontWeight:700,padding:'0 4px'}}>✕</button>
                  )}
                </div>
              ))}
            </div>
            <button className={styles.btnAddReward} onClick={addArticle} style={{marginBottom: 20}}>
              + Ajouter un article
            </button>

            {/* RÉCOMPENSES */}
            <div className={styles.cLabel}>Récompenses</div>
            <div className={styles.rewardsList}>
              {rewards.map((r, i) => (
                <div key={i} className={styles.rewardRow}>
                  <input
                    type="text"
                    value={r.nom}
                    placeholder="Ex : Café offert"
                    onChange={e => updateReward(i, 'nom', e.target.value)}
                  />
                  <span className={styles.sep}>à</span>
                  <input
                    type="number"
                    value={r.points_requis}
                    min="1"
                    onChange={e => updateReward(i, 'points_requis', +e.target.value)}
                  />
                  <span className={styles.unit}>pts</span>
                </div>
              ))}
            </div>
            <button className={styles.btnAddReward} onClick={addReward}>+ Ajouter une récompense</button>
            <p className={styles.configHint}>Tout est modifiable depuis "Système de points"</p>
          </div>

          <button className={styles.btnBlue} onClick={handleFinish} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Accéder à mon tableau de bord →'}
          </button>
          <span className={styles.skip} onClick={() => navigate('/dashboard')}>
            Passer cette étape — je configurerai plus tard
          </span>
        </div>
      </div>
    </div>
  )
}
