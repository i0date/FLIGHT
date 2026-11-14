import { Component, type ReactNode } from 'react';
import { reportError } from '../lib/errors';

// If a screen crashes, show a way back instead of a blank page, and send a crash report.
export class Turbulence extends Component<{ screen: string; onHome: () => void; children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: unknown) {
    reportError(error, this.props.screen);
  }

  render() {
    if (!this.state.crashed) return this.props.children;
    return (
      <div className="screen">
        <header className="page-head">
          <h1>Turbulence</h1>
          <p>Something went wrong on this screen. Your streak, scores and miles are safe. We've been told about it.</p>
        </header>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Reload</button>
        <button className="btn btn-ghost" onClick={this.props.onHome}>Back to the terminal</button>
      </div>
    );
  }
}
