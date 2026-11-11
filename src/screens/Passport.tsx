import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useProfile } from '../lib/profile';
import { statusFor } from '../lib/miles';
import { preparePhoto, removePhoto, uploadPhoto, usePassportPhoto } from '../lib/photo';
import { SignIn } from '../components/SignIn';
import { Gear } from '../components/Icons';
import { isOwner } from '../lib/owner';

// Only fetched for the owner, so the card isn't in anyone else's download.
const OwnerLink = lazy(() => import('./Owner').then((m) => ({ default: m.OwnerLink })));
import { IdentityPage, LogPage, PostcardsPage, StampsPage, VisasPage } from '../components/PassportPages';
import { PlaneMascot } from '../components/Aircraft';
import type { Screen } from '../types';

const PAGES = [
  { id: 'id', label: 'Identity' },
  { id: 'stamps', label: 'Stamps' },
  { id: 'postcards', label: 'Postcards' },
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
  const { profile, account, sync, accountsEnabled } = useProfile();
  const [open, setOpen] = useState(readOpen);
  const [page, setPage] = useState<PageId>('id');
  const photoUrl = usePassportPhoto(account?.userId, profile.photoUpdatedAt);
  const fileInput = useRef<HTMLInputElement>(null);
  const { tier } = statusFor(profile);
  // The control tower link shows only for the people who run FLIGHT (the server checks again).
  const [owner, setOwner] = useState(false);
  useEffect(() => {
    if (account) isOwner().then(setOwner);
    else setOwner(false);
  }, [account]);

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
          <div className="pp-top">
            <span className="mono small muted">PASSPORT</span>
            <button className="pp-close" onClick={() => setOpenRemembered(false)}>Close ✕</button>
          </div>
          <div className="pp-tabs" role="tablist" aria-label="Passport pages">
            {PAGES.map((p) => (
              <button key={p.id} role="tab" aria-selected={page === p.id} className={page === p.id ? 'on' : ''} onClick={() => setPage(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
          <div className="pp-book" key={page}>
            {page === 'id' && <IdentityPage profile={profile} account={account} photoUrl={photoUrl} onPhotoTap={account ? () => fileInput.current?.click() : undefined} />}
            {page === 'stamps' && <StampsPage profile={profile} go={go} />}
            {page === 'postcards' && <PostcardsPage profile={profile} go={go} />}
            {page === 'visas' && <VisasPage profile={profile} go={go} />}
            {page === 'log' && <LogPage profile={profile} />}
          </div>
          {account && sync !== 'local' && (
            <p className="pp-sync">{sync === 'saved' ? 'Saved to your account' : sync === 'syncing' ? 'Saving…' : 'Could not save — will retry on your next flight'}</p>
          )}
        </>
      )}

      <PassportOffice key={`${account?.userId}-${profile.name}-${profile.homeChurch}`} fileInput={fileInput} photoUrl={photoUrl} />

      {account && owner && <Suspense fallback={null}><OwnerLink go={go} /></Suspense>}
      <button className="btn btn-ghost settings-link" onClick={() => go({ name: 'settings' })}>
        <Gear size={18} /> Settings
      </button>
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
