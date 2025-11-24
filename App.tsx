import React, { useState, useCallback, useMemo, createContext, useContext, useEffect } from 'react';
import type { AppView, QuestionBank, ExamResult, ToastMessage } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import QuestionBankManager from './components/views/QuestionBankManager';
import TakeExamView from './components/views/TakeExamView';
import ExamHistory from './components/views/ExamHistory';
import ImportExport from './components/views/ImportExport';
import { ToastContainer, Spinner } from './components/ui';
import { initDB, getAllBanks, saveAllBanksToDB } from './services/db';

interface AppContextType {
    banks: QuestionBank[];
    setBanks: (value: QuestionBank[] | ((val: QuestionBank[]) => QuestionBank[])) => void;
    history: ExamResult[];
    addResult: (result: ExamResult) => void;
    deleteHistory: (id: string) => void;
    activeBankId: string | null;
    setActiveBankId: (value: string | null | ((val: string | null) => string | null)) => void;
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
    
    // We now manage banks in state, but load/save to IndexedDB
    const [banks, setBanksState] = useState<QuestionBank[]>([]);
    const [isLoadingBanks, setIsLoadingBanks] = useState(true);

    // Keep history and settings in LocalStorage (they are small)
    const [history, setHistory] = useLocalStorage<ExamResult[]>('examHistory', []);
    const [activeBankId, setActiveBankId] = useLocalStorage<string | null>('activeBankId', null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Initialize DB and Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                await initDB();
                const dbBanks = await getAllBanks();
                
                // MIGRATION: Check if we have data in LocalStorage but NOT in DB
                const localBanksStr = window.localStorage.getItem('questionBanks');
                if (localBanksStr && dbBanks.length === 0) {
                    try {
                        const localBanks: QuestionBank[] = JSON.parse(localBanksStr);
                        if (localBanks.length > 0) {
                            console.log("Migrating data from LocalStorage to IndexedDB...");
                            await saveAllBanksToDB(localBanks);
                            setBanksState(localBanks);
                            // Optional: Clear LocalStorage after successful migration to free up space
                            window.localStorage.removeItem('questionBanks');
                            addToast("Data migrated to high-capacity storage!", "success");
                        }
                    } catch (e) {
                        console.error("Migration failed", e);
                    }
                } else {
                    setBanksState(dbBanks);
                }
            } catch (error) {
                console.error("Failed to load banks from DB", error);
                addToast("Error loading data database.", "error");
            } finally {
                setIsLoadingBanks(false);
            }
        };
        loadData();
    }, []);

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

    // Custom setBanks that updates State AND IndexedDB
    const setBanks = useCallback((value: QuestionBank[] | ((val: QuestionBank[]) => QuestionBank[])) => {
        setBanksState(prevBanks => {
            const newBanks = value instanceof Function ? value(prevBanks) : value;
            // Fire and forget save (or could handle error)
            saveAllBanksToDB(newBanks).catch(err => {
                console.error("Failed to save to DB", err);
                addToast("Failed to save changes to storage.", "error");
            });
            return newBanks;
        });
    }, [addToast]);

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
        if (isLoadingBanks) {
            return (
                <div className="h-full flex flex-col items-center justify-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-slate-500">Loading your question banks...</p>
                </div>
            );
        }

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
