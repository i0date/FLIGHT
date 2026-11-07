import { useState } from 'react';
import { canReport, REASONS, reportQuestion, type Reason } from '../lib/report';
import type { PlayQuestion } from '../types';

// A quiet link under an answer that opens a short form to flag the question for the ground crew.
export function ReportQuestion({ question }: { question: PlayQuestion }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<Reason | null>(null);
  const [note, setNote] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  if (!canReport) return null;
  if (state === 'sent') return <p className="report-done small">Thanks. The ground crew will check this question.</p>;
  if (!open) {
    return (
      <button className="report-link" onClick={() => setOpen(true)}>
        Something wrong with this question?
      </button>
    );
  }

  const send = async () => {
    if (!reason) return;
    setState('sending');
    try {
      await reportQuestion(question, reason, note);
      setState('sent');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send. Try again.');
      setState('error');
    }
  };

  return (
    <div className="report">
      <p className="report-title">What’s wrong?</p>
      <div className="report-reasons">
        {REASONS.map((r) => (
          <button key={r.id} className={`report-reason ${reason === r.id ? 'on' : ''}`} aria-pressed={reason === r.id} onClick={() => setReason(r.id)}>
            {r.label}
          </button>
        ))}
      </div>
      <textarea
        className="report-note"
        rows={2}
        maxLength={500}
        placeholder="Optional: what should it say? A verse helps."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      {state === 'error' && <p className="notice notice-error small">{error}</p>}
      <div className="report-actions">
        <button className="btn btn-small btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        <button className="btn btn-small btn-primary" disabled={!reason || state === 'sending'} onClick={send}>
          {state === 'sending' ? 'Sending…' : 'Send report'}
        </button>
      </div>
    </div>
  );
}
