import { useRef, useState } from 'react';
import { useProfile } from '../lib/profile';
import { milesFor, tierFor } from '../lib/miles';
import { preparePhoto, removePhoto, uploadPhoto, usePassportPhoto } from '../lib/photo';
import { SignIn } from '../components/SignIn';
import { callApi } from '../lib/billing';
import { IdentityPage, LogPage, StampsPage, VisasPage } from '../components/PassportPages';
import { PlaneMascot } from '../components/Aircraft';
import type { Screen } from '../types';

const PAGES = [
  { id: 'id', label: 'Identity' },
  { id: 'stamps', label: 'Stamps' },
  { id: 'visas', label: 'Visas' },
  { id: 'log', label: 'Log' },
] as const;
type PageId = (typeof PAGES)[number]['id'];

const OPEN_KEY = 'flight.passport.open';
const readOpen = () => {
  try {
    return sessionStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
};

export function Passport({ go }: { go: (s: Screen) => void }) {
  const { profile, update, account, sync, accountsEnabled, signOut } = useProfile();
  const [open, setOpen] = useState(readOpen);
  const [page, setPage] = useState<PageId>('id');
  const photoUrl = usePassportPhoto(account?.userId, profile.photoUpdatedAt);
  const fileInput = useRef<HTMLInputElement>(null);
  const { tier } = tierFor(milesFor(profile));

  const setOpenRemembered = (value: boolean) => {
    setOpen(value);
    try {
      sessionStorage.setItem(OPEN_KEY, value ? '1' : '0');
    } catch {
      /* not remembered this time */
    }
  };

  return (
    <div className="screen">
      {!account && <SignIn enabled={accountsEnabled} />}

      {!open ? (
        <button className="pp-cover" onClick={() => setOpenRemembered(true)} aria-label="Open passport">
          <span className="pp-cover-top mono">KINGDOM OF HEAVEN · FREQUENT FLYER</span>
          <span className="pp-crest" aria-hidden="true">
            <PlaneMascot width={150} />
          </span>
          <span className="pp-cover-title">PASSPORT</span>
          <span className="pp-cover-sub mono">FLIGHT</span>
          <span className="pp-cover-band" style={{ background: tier.color }}>{tier.name.toUpperCase()}</span>
          <span className="pp-cover-hint">Tap to open</span>
        </button>
      ) : (
        <>
          <div className="pp-tabs" role="tablist" aria-label="Passport pages">
            {PAGES.map((p) => (
              <button key={p.id} role="tab" aria-selected={page === p.id} className={page === p.id ? 'on' : ''} onClick={() => setPage(p.id)}>
                {p.label}
              </button>
            ))}
            <button className="pp-close" onClick={() => setOpenRemembered(false)} aria-label="Close passport">Close</button>
          </div>
          <div className="pp-book" key={page}>
            {page === 'id' && <IdentityPage profile={profile} account={account} photoUrl={photoUrl} onPhotoTap={account ? () => fileInput.current?.click() : undefined} />}
            {page === 'stamps' && <StampsPage profile={profile} go={go} />}
            {page === 'visas' && <VisasPage profile={profile} go={go} />}
            {page === 'log' && <LogPage profile={profile} />}
          </div>
          {account && sync !== 'local' && (
            <p className="pp-sync">{sync === 'saved' ? 'Saved to your account' : sync === 'syncing' ? 'Saving…' : 'Could not save — will retry on your next flight'}</p>
          )}
        </>
      )}

      <PassportOffice key={`${account?.userId}-${profile.name}-${profile.homeChurch}`} fileInput={fileInput} photoUrl={photoUrl} />

      {account && (
        <>
          <label className="card switch-row">
            <span>
              <strong>Show me on the public leaderboard</strong>
              <span className="small muted">Your passenger name, streak and today's score. Crews always see you.</span>
            </span>
            <input type="checkbox" checked={profile.onLeaderboard} onChange={(e) => update((p) => ({ ...p, onLeaderboard: e.target.checked }))} />
          </label>
          <div className="card">
            <p className="small muted">Signed in as {account.email}</p>
            <button className="btn btn-ghost" onClick={signOut}>Sign out</button>
          </div>
          <DeleteAccount owner={account.membership?.role === 'owner'} onDeleted={signOut} />
        </>
      )}
      <p className="fineprint legal-links">
        <button onClick={() => go({ name: 'privacy' })}>Privacy</button> · <button onClick={() => go({ name: 'terms' })}>Terms</button>
      </p>
    </div>
  );
}

// Edit the details printed in the passport: photo, name and home church.
function PassportOffice({ fileInput, photoUrl }: { fileInput: React.RefObject<HTMLInputElement>; photoUrl: string | null }) {
  const { profile, update, account } = useProfile();
  const [name, setName] = useState(profile.name);
  const [church, setChurch] = useState(profile.homeChurch);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const changed = name.trim() !== profile.name || church.trim() !== profile.homeChurch;

  const choosePhoto = async (file: File | undefined) => {
    if (!file || !account) return;
    setPhotoBusy(true);
    setError('');
    setMessage('');
    try {
      const photo = await preparePhoto(file);
      await uploadPhoto(account.userId, photo);
      update((p) => ({ ...p, photoUpdatedAt: new Date().toISOString() }));
      setMessage('Photo added to your passport.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not upload the photo.');
    } finally {
      setPhotoBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const deletePhoto = async () => {
    if (!account) return;
    setPhotoBusy(true);
    setError('');
    try {
      await removePhoto(account.userId);
      update((p) => ({ ...p, photoUpdatedAt: null }));
      setMessage('Photo removed.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove the photo.');
    } finally {
      setPhotoBusy(false);
    }
  };

  return (
    <section className="card office">
      <p className="mono small muted">PASSPORT OFFICE</p>
      <strong>Your details</strong>

      <div className="office-photo">
        <div className="office-photo-preview">{photoUrl ? <img src={photoUrl} alt="" /> : <span>{profile.name.slice(0, 1).toUpperCase()}</span>}</div>
        <div className="office-photo-actions">
          {account ? (
            <>
              <button className="btn btn-primary btn-small" disabled={photoBusy} onClick={() => fileInput.current?.click()}>
                {photoBusy ? 'Working…' : photoUrl ? 'Change photo' : 'Add a photo'}
              </button>
              {photoUrl && <button className="btn btn-ghost btn-small" disabled={photoBusy} onClick={deletePhoto}>Remove</button>}
              <p className="small muted">Optional. Only you can see it. We crop it to passport shape.</p>
            </>
          ) : (
            <p className="small muted">Sign in to add a passport photo.</p>
          )}
        </div>
        <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => choosePhoto(e.target.files?.[0])} />
      </div>

      <form
        className="office-form"
        onSubmit={(e) => {
          e.preventDefault();
          update((p) => ({ ...p, name: name.trim() || 'Traveller', homeChurch: church.trim() }));
          setMessage('Details saved.');
        }}
      >
        <label>
          <span>Passenger name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={24} />
        </label>
        <label>
          <span>Home church <small>(optional)</small></span>
          <input value={church} onChange={(e) => setChurch(e.target.value)} maxLength={60} placeholder="e.g. Grace Chapel, Toronto" />
        </label>
        <button className="btn btn-primary" disabled={!changed}>Save details</button>
      </form>
      {message && <p className="small office-ok">{message}</p>}
      {error && <p className="form-error small">{error}</p>}
    </section>
  );
}

// Permanently delete the account, after typing DELETE to confirm.
function DeleteAccount({ owner, onDeleted }: { owner: boolean; onDeleted: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const remove = async () => {
    setBusy(true);
    setError('');
    try {
      await callApi('delete-account', {});
      // Clear this device too, so nothing of the account is left behind.
      try {
        Object.keys(localStorage).filter((k) => k.startsWith('flight.')).forEach((k) => localStorage.removeItem(k));
      } catch {
        /* nothing stored */
      }
      await onDeleted().catch(() => undefined);
      window.location.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button className="btn btn-ghost danger-link" onClick={() => setOpen(true)}>Delete my account</button>
    );
  }
  return (
    <section className="card danger">
      <strong>Delete your account?</strong>
      <p className="small">This permanently removes your passport: streak, miles, stamps, Book Club progress, photo, crews and leaderboard entries. It cannot be undone.</p>
      {owner && <p className="small"><strong>Your Flight Club plan will be cancelled straight away</strong>, with no further charges, and anyone who joined it with your invite code will lose Flight Club too.</p>}
      <label className="small">
        Type DELETE to confirm
        <input value={typed} onChange={(e) => setTyped(e.target.value)} autoCapitalize="characters" autoComplete="off" />
      </label>
      {error && <p className="form-error small">{error}</p>}
      <button className="btn btn-danger" disabled={busy || typed.trim().toUpperCase() !== 'DELETE'} onClick={remove}>{busy ? 'Deleting…' : 'Delete my account forever'}</button>
      <button className="btn btn-ghost" disabled={busy} onClick={() => { setOpen(false); setTyped(''); }}>Keep my account</button>
    </section>
  );
}
