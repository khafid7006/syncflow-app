import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EEEDED] flex items-center justify-center p-4 font-sans text-slate-900">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D71313]/10 text-[#D71313] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              Terjadi Kesalahan Tampilan
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {this.state.error?.message || 'Sistem mendeteksi inkonsistensi rendering pada peramban Anda.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-[#0D1282] hover:bg-[#090D5E] text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Muat Ulang & Reset Cache Aplikasi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
