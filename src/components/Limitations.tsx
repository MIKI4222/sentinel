export function Limitations() {
  return <section className="card space-y-4"><h2 className="text-xl font-semibold">Limits of this deployment</h2><ul className="list-disc pl-5 space-y-3">
    <li>No verdict-age check; ACTIVE can be the initial unchecked state. Regular checks are necessary.</li>
    <li>No consensus means this check does not change state or enable the pause.</li>
    <li>Standard GitHub minor, empty bodies, invalid JSON and unknown formats classify as degraded. HTTP codes are not checked.</li>
    <li>Anyone can check without a contract rate limit. The UI cooldown is only UX.</li>
    <li>The owner can select a controlled source and recover using its operational verdict.</li>
    <li>Incidents accumulate. Threshold 1 and fail-closed true are fixed constructor settings.</li>
    <li>The guarded method is a counter demo, not protection for an unrelated transaction.</li>
  </ul><p className="text-sentinel-textMuted">Freshness warnings, HTTPS inputs and keeper scheduling are operational mitigations, not on-chain guarantees.</p></section>;
}
