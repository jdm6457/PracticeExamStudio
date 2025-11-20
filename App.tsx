import React, { useState, useCallback, useMemo, createContext, useContext } from 'react';
import type { AppView, QuestionBank, ExamResult, ToastMessage } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import QuestionBankManager from './components/views/QuestionBankManager';
import TakeExamView from './components/views/TakeExamView';
import ExamHistory from './components/views/ExamHistory';
import ImportExport from './components/views/ImportExport';
import { ToastContainer } from './components/ui';

interface AppContextType {
    banks: QuestionBank[];
    setBanks: (banks: QuestionBank[]) => void;
    history: ExamResult[];
    addResult: (result: ExamResult) => void;
    deleteHistory: (id: string) => void;
    activeBankId: string | null;
    setActiveBankId: (id: string | null) => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppContext must be used within an AppProvider");
    return context;
};

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('banks');
    const [banks, setBanks] = useLocalStorage<QuestionBank[]>('questionBanks', []);
    const [history, setHistory] = useLocalStorage<ExamResult[]>('examHistory', []);
    const [activeBankId, setActiveBankId] = useLocalStorage<string | null>('activeBankId', null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
        const newToast = { id: Date.now(), message, type };
        setToasts(currentToasts => [...currentToasts, newToast]);
    }, []);
    
    const dismissToast = (id: number) => {
        setToasts(currentToasts => currentToasts.filter(t => t.id !== id));
    };

    const addResult = useCallback((result: ExamResult) => {
        setHistory(prevHistory => [result, ...prevHistory]);
    }, [setHistory]);

    const deleteHistory = useCallback((id: string) => {
        setHistory(prevHistory => prevHistory.filter(h => h.id !== id));
    }, [setHistory]);

    const contextValue = useMemo(() => ({
        banks,
        setBanks,
        history,
        addResult,
        deleteHistory,
        activeBankId,
        setActiveBankId,
        addToast,
    }), [banks, setBanks, history, addResult, deleteHistory, activeBankId, setActiveBankId, addToast]);

    const renderView = () => {
        switch (view) {
            case 'banks':
                return <QuestionBankManager />;
            case 'take_exam':
                return <TakeExamView onNavigate={setView} />;
            case 'history':
                return <ExamHistory />;
            case 'import_export':
                return <ImportExport />;
            default:
                return <QuestionBankManager />;
        }
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="flex min-h-screen">
                <Sidebar currentView={view} onNavigate={setView} />
                <main className="flex-grow p-6 lg:p-8">
                    {renderView()}
                </main>
                <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            </div>
        </AppContext.Provider>
    );
};

export default App;