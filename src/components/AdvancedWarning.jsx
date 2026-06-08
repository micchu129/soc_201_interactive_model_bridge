import { useState } from 'react'

export default function AdvancedWarning({ onBack, onProceed }) {
  const [dismiss, setDismiss] = useState(false)
  return <div className="modal-backdrop">
    <div className="panel modal-card">
      <p className="kicker">Advanced options</p>
      <h2>Proceed carefully</h2>
      <p>Advanced options change model behavior and may produce unexpected or less stable outcomes.</p>
      <label className="check-row"><input type="checkbox" checked={dismiss} onChange={event => setDismiss(event.target.checked)} /> Do not warn me again</label>
      <div className="button-row"><button className="button secondary" onClick={onBack}>Go back</button><button className="button primary" onClick={() => onProceed(dismiss)}>Proceed</button></div>
    </div>
  </div>
}
