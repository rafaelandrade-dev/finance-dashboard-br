import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="card p-8 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-bear-500/10 border border-bear-500/20 flex items-center justify-center">
                        <AlertTriangle size={24} className="text-bear-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Algo deu errado</h3>
                        <p className="text-xs text-gray-500 max-w-xs">
                            {this.state.error?.message || 'Ocorreu um erro inesperado neste componente.'}
                        </p>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="btn-primary"
                    >
                        <RefreshCw size={14} />
                        Tentar novamente
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// Functional error fallback for async errors
export const ErrorFallback = ({ message, onRetry }) => (
    <div className="card p-8 flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-bear-500/10 border border-bear-500/20 flex items-center justify-center">
            <AlertTriangle size={24} className="text-bear-400" />
        </div>
        <div>
            <h3 className="text-sm font-bold text-white mb-1">Erro ao carregar dados</h3>
            <p className="text-xs text-gray-500 max-w-xs">{message || 'Usando dados de demonstração.'}</p>
        </div>
        {onRetry && (
            <button onClick={onRetry} className="btn-primary">
                <RefreshCw size={14} />
                Recarregar
            </button>
        )}
    </div>
);
