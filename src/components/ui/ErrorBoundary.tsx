import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
          <div className="w-full max-w-md p-8 rounded-[32px] border border-white/10 bg-neutral-950/80 backdrop-blur-2xl shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto text-2xl">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Terjadi Kendala Tampilan
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Aplikasi mendeteksi kesalahan sementara pada pemuatan komponen.
              </p>
              {this.state.error?.message && (
                <div className="p-3 rounded-xl bg-neutral-900 border border-white/5 text-[11px] font-mono text-zinc-400 text-left truncate">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full py-3 rounded-2xl bg-white text-zinc-950 text-xs font-bold hover:bg-zinc-200 transition-all shadow-xl cursor-pointer font-sans"
            >
              🔄 Muat Ulang Aplikasi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
