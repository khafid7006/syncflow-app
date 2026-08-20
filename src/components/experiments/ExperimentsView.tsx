import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  FlaskConical, Plus, Sparkles, TrendingUp, 
  CheckCircle2, Clock, AlertCircle, ArrowUpRight,
  HelpCircle, CheckCircle, RefreshCw, XCircle
} from 'lucide-react';
import { Experiment, ExperimentStage, ExperimentDecision } from '../../types';

export const ExperimentsView: React.FC = () => {
  const { 
    currentUser, 
    experiments, 
    teams, 
    createExperiment, 
    updateExperimentStage,
    makeExperimentDecision 
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamId, setTeamId] = useState(currentUser.teamId || 'team-2');
  const [name, setName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [metricName, setMetricName] = useState('Conversion Rate');
  const [baseline, setBaseline] = useState('10%');
  const [target, setTarget] = useState('20%');

  // Decision Modal
  const [selectedExpForDecision, setSelectedExpForDecision] = useState<Experiment | null>(null);
  const [decision, setDecision] = useState<ExperimentDecision>('KEEP');
  const [decisionReason, setDecisionReason] = useState('');

  const filteredExperiments = experiments.filter(exp => {
    if (currentUser.role === 'PROJECT_LEADER' && currentUser.teamId) {
      return exp.teamId === currentUser.teamId;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !hypothesis.trim()) return;

    createExperiment({
      teamId,
      name: name.trim(),
      hypothesis: hypothesis.trim(),
      ownerId: currentUser.id,
      stage: 'HYPOTHESIS',
      metricName,
      baseline,
      target,
      decision: 'PENDING'
    });

    setIsCreateOpen(false);
    setName('');
    setHypothesis('');
  };

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpForDecision || !decisionReason.trim()) return;

    makeExperimentDecision(selectedExpForDecision.id, decision, decisionReason.trim());
    setSelectedExpForDecision(null);
    setDecisionReason('');
  };

  const getStageBadge = (stage: ExperimentStage) => {
    switch (stage) {
      case 'HYPOTHESIS':
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">1. HYPOTHESIS</span>;
      case 'EXPERIMENT':
        return <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">2. DESIGN</span>;
      case 'EXECUTION':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">3. LIVE RUNNING</span>;
      case 'MEASUREMENT':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">4. MEASURING</span>;
      case 'DECISION':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">5. DECIDED</span>;
      default:
        return null;
    }
  };

  const getDecisionBadge = (d: ExperimentDecision) => {
    switch (d) {
      case 'KEEP':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Keep & Rollout
          </span>
        );
      case 'ITERATE':
        return (
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Iterate / Refine
          </span>
        );
      case 'ABANDON':
        return (
          <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Abandon Hypothesis
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded">
            Decision Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Marketing & Growth Pod Experiments
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scientific growth lifecycle: <strong>Hypothesis → Experiment → Execution → Measurement → Decision (Keep / Iterate / Drop)</strong>.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Launch New Experiment
        </button>
      </div>

      {/* Experiment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExperiments.map(exp => {
          const team = teams.find(t => t.id === exp.teamId);

          return (
            <div 
              key={exp.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded font-bold">
                    {team?.name.split(' - ')[0]}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {getStageBadge(exp.stage)}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {exp.name}
                </h3>

                {/* Hypothesis */}
                <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/40 space-y-1 text-xs">
                  <div className="text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-mono font-bold">
                    Scientific Hypothesis:
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                    "{exp.hypothesis}"
                  </p>
                </div>

                {/* Target Metric & Lift */}
                <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-400 text-[10px] block">Metric</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{exp.metricName}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-400 text-[10px] block">Baseline</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{exp.baseline}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border">
                    <span className="text-slate-400 text-[10px] block">Target</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{exp.target}</span>
                  </div>
                </div>

                {/* Result if measured */}
                {exp.result && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border text-xs space-y-1">
                    <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">Measurement Outcome:</span>
                    <p className="text-slate-600 dark:text-slate-400">{exp.result}</p>
                  </div>
                )}

                {/* Decision Output */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Decision:</span>
                    {getDecisionBadge(exp.decision)}
                  </div>

                  <button
                    onClick={() => setSelectedExpForDecision(exp)}
                    className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
                  >
                    Set Decision →
                  </button>
                </div>
              </div>

              {/* Stage Progress Bar / Stepper */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Stage Progression:</span>
                <div className="flex items-center gap-1">
                  {(['HYPOTHESIS', 'EXPERIMENT', 'EXECUTION', 'MEASUREMENT', 'DECISION'] as ExperimentStage[]).map((stg, i) => (
                    <button
                      key={stg}
                      onClick={() => updateExperimentStage(exp.id, stg)}
                      title={`Move to ${stg}`}
                      className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors ${
                        exp.stage === stg
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DECISION MODAL */}
      {selectedExpForDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              Experiment Decision & Conclusion
            </h3>
            <p className="text-xs text-slate-500">
              For <strong>{selectedExpForDecision.name}</strong>
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Final Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDecision('KEEP')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      decision === 'KEEP' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    KEEP (Rollout)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('ITERATE')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      decision === 'ITERATE' ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    ITERATE
                  </button>
                  <button
                    type="button"
                    onClick={() => setDecision('ABANDON')}
                    className={`p-2 rounded-lg border text-center font-bold transition-all ${
                      decision === 'ABANDON' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-700'
                    }`}
                  >
                    ABANDON
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Decision Rationale & Next Steps *</label>
                <textarea
                  required
                  rows={3}
                  value={decisionReason}
                  onChange={e => setDecisionReason(e.target.value)}
                  placeholder="Explain statistical significance, impact on business metric, or learnings..."
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedExpForDecision(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Save Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-indigo-600" />
              Launch Marketing Experiment
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Team</label>
                <select
                  value={teamId}
                  onChange={e => setTeamId(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Experiment Name / Code *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Exp #17: Automated WhatsApp Notification for Failed Checkout"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Hypothesis Statement *</label>
                <textarea
                  required
                  value={hypothesis}
                  onChange={e => setHypothesis(e.target.value)}
                  placeholder="If we send WhatsApp reminder with 1-click retry token within 5 min, checkout recovery will increase by +15%..."
                  className="w-full h-20 p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Metric</label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={e => setMetricName(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Baseline</label>
                  <input
                    type="text"
                    value={baseline}
                    onChange={e => setBaseline(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Goal</label>
                  <input
                    type="text"
                    value={target}
                    onChange={e => setTarget(e.target.value)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg"
                >
                  Launch Experiment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
