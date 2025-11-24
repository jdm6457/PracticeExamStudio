import React, { useState, useMemo, useCallback } from 'react';
import { useAppContext } from '../../App';
import type { Question, QuestionBank } from '../../types';
import { Button, Modal, RichText } from '../ui';
import { PlusIcon, EditIcon, TrashIcon } from '../icons';
import QuestionEditor from './QuestionEditor';
import AddQuestions from './AddQuestions';

const QuestionBankManager: React.FC = () => {
    const { banks, setBanks, activeBankId, setActiveBankId, addToast } = useAppContext();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isRenameModalOpen, setRenameModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [newBankName, setNewBankName] = useState('');
    const [bankToEdit, setBankToEdit] = useState<QuestionBank | null>(null);

    const activeBank = useMemo(() => banks.find(b => b.id === activeBankId), [banks, activeBankId]);

    const handleCreateBank = () => {
        if (!newBankName.trim()) {
            addToast("Bank name cannot be empty.", "error");
            return;
        }
        const newBank: QuestionBank = { id: crypto.randomUUID(), name: newBankName.trim(), questions: [] };
        const updatedBanks = [...banks, newBank];
        setBanks(updatedBanks);
        setActiveBankId(newBank.id);
        setNewBankName('');
        setCreateModalOpen(false);
        addToast(`Bank "${newBank.name}" created successfully.`, "success");
    };
    
    const handleRenameBank = () => {
        if (!bankToEdit || !newBankName.trim()) {
            addToast("Bank name cannot be empty.", "error");
            return;
        }
        const updatedBanks = banks.map(b => b.id === bankToEdit.id ? { ...b, name: newBankName.trim() } : b);
        setBanks(updatedBanks);
        setNewBankName('');
        setRenameModalOpen(false);
        setBankToEdit(null);
        addToast(`Bank renamed successfully.`, "success");
    };

    const handleDeleteBank = () => {
        if (!bankToEdit) return;
        const updatedBanks = banks.filter(b => b.id !== bankToEdit.id);
        setBanks(updatedBanks);
        if (activeBankId === bankToEdit.id) {
            setActiveBankId(updatedBanks.length > 0 ? updatedBanks[0].id : null);
        }
        setDeleteModalOpen(false);
        setBankToEdit(null);
        addToast(`Bank deleted successfully.`, "success");
    };

    const openRenameModal = (bank: QuestionBank) => {
        setBankToEdit(bank);
        setNewBankName(bank.name);
        setRenameModalOpen(true);
    };

    const openDeleteModal = (bank: QuestionBank) => {
        setBankToEdit(bank);
        setDeleteModalOpen(true);
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            <header className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Question Banks</h1>
                <Button onClick={() => setCreateModalOpen(true)}><PlusIcon /> New Bank</Button>
            </header>

            {banks.length === 0 ? (
                 <div className="flex-grow flex items-center justify-center bg-white dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="text-center p-8">
                        <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">No Question Banks Found</h2>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Get started by creating your first question bank.</p>
                        <Button onClick={() => setCreateModalOpen(true)} className="mt-6"><PlusIcon /> Create New Bank</Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                     {banks.map(bank => (
                        <div key={bank.id} className={`p-5 rounded-xl cursor-pointer transition-all duration-200 transform hover:-translate-y-1 ${activeBankId === bank.id ? 'ring-2 ring-indigo-500 bg-white dark:bg-slate-800 shadow-lg' : 'bg-white dark:bg-slate-800 shadow-md hover:shadow-lg'}`} onClick={() => setActiveBankId(bank.id)}>
                            <div className="flex justify-between items-start">
                                <div className="flex-1 pr-2">
                                    <h3 className="font-bold text-lg truncate">{bank.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{bank.questions.length} questions</p>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={(e) => { e.stopPropagation(); openRenameModal(bank);}} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-700"><EditIcon /></button>
                                    <button onClick={(e) => { e.stopPropagation(); openDeleteModal(bank);}} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-700"><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <div className="flex-grow min-h-0">
                {activeBank ? (
                    <QuestionList bank={activeBank} />
                ) : banks.length > 0 && (
                     <div className="flex-grow h-full flex items-center justify-center bg-white dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="text-center">
                             <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">Select a Bank</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Choose a question bank from the list above to view its questions.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Bank">
                <div className="space-y-4">
                    <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bank Name</label>
                    <input type="text" id="bankName" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Python Basics" />
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateBank}>Create</Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isRenameModalOpen} onClose={() => setRenameModalOpen(false)} title={`Rename Bank "${bankToEdit?.name}"`}>
                 <div className="space-y-4">
                    <label htmlFor="renameBankName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">New Bank Name</label>
                    <input type="text" id="renameBankName" value={newBankName} onChange={(e) => setNewBankName(e.target.value)} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500" />
                     <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => {setRenameModalOpen(false); setBankToEdit(null);}}>Cancel</Button>
                        <Button onClick={handleRenameBank}>Rename</Button>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} title={`Delete Bank "${bankToEdit?.name}"?`}>
                <p>Are you sure you want to delete this bank and all its questions? This action cannot be undone.</p>
                <div className="flex justify-end gap-2 mt-6">
                    <Button variant="secondary" onClick={() => {setDeleteModalOpen(false); setBankToEdit(null);}}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteBank}>Delete</Button>
                </div>
            </Modal>
        </div>
    );
};

const QuestionList: React.FC<{ bank: QuestionBank }> = ({ bank }) => {
    const { setBanks, addToast } = useAppContext();
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [showAddQuestions, setShowAddQuestions] = useState(false);

    const handleSaveQuestion = (updatedQuestion: Question) => {
        setBanks((prevBanks) => {
            return prevBanks.map(b => {
                if (b.id === bank.id) {
                    const updatedQuestions = b.questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
                    return { ...b, questions: updatedQuestions };
                }
                return b;
            });
        });
        setEditingQuestion(null);
        addToast("Question saved", "success");
    };

    const handleDeleteQuestion = (questionId: string) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            setBanks((prevBanks) => {
                return prevBanks.map(b => {
                    if (b.id === bank.id) {
                        const updatedQuestions = b.questions.filter(q => q.id !== questionId);
                        return { ...b, questions: updatedQuestions };
                    }
                    return b;
                });
            });
            addToast("Question deleted", "success");
        }
    };
    
    const handleQuestionsAdded = useCallback((newQuestions: Question[]) => {
        setBanks((prevBanks) => {
            return prevBanks.map(b => {
                if (b.id === bank.id) {
                    return { ...b, questions: [...b.questions, ...newQuestions] };
                }
                return b;
            });
        });
        setShowAddQuestions(false);
        addToast("Questions added", "success");
    }, [bank.id, setBanks, addToast]);

    const renderQuestionContent = (q: Question) => {
        if (q.type === 'dropdown' && q.dropdowns) {
            return q.dropdowns.map((drop, idx) => (
                <li key={idx} className="text-slate-600 dark:text-slate-300">
                    <span className="font-semibold text-xs uppercase tracking-wide text-slate-400 mr-2">Dropdown {idx + 1}</span>
                    {drop.label} <span className="italic text-slate-400">[Select...]</span>
                </li>
            ));
        }
        
        if (q.type === 'drag_drop' && q.dropZones) {
             return (
                 <>
                    <li className="text-xs font-bold uppercase text-slate-400 mt-2">Draggable Items:</li>
                    {q.options.map(opt => (
                        <li key={opt.label} className="text-slate-600 dark:text-slate-300 inline-block mr-2 mb-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">
                            {opt.text}
                        </li>
                    ))}
                    <li className="text-xs font-bold uppercase text-slate-400 mt-2">Drop Zones:</li>
                    {q.dropZones.map((zone, idx) => (
                        <li key={idx} className="text-slate-600 dark:text-slate-300">
                            <span className="mr-2">Zone {idx+1}:</span>
                            <span className="border-b border-dashed border-slate-400 px-4">{zone.label || 'Empty Slot'}</span>
                        </li>
                    ))}
                 </>
             );
        }

        // Default Single/Multiple
        return q.options.map(opt => (
            <li key={opt.label} className={q.correctAnswers.includes(opt.label) ? 'text-green-600 dark:text-green-400 font-medium' : 'text-slate-600 dark:text-slate-300'}>
                <span className="font-semibold">{opt.label})</span> {opt.text}
            </li>
        ));
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold truncate pr-4">{bank.name}</h2>
                <Button onClick={() => setShowAddQuestions(true)}><PlusIcon /> Add Questions</Button>
            </div>
            
            {bank.questions.length === 0 ? (
                 <div className="flex-grow flex items-center justify-center text-center">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">This bank is empty.</p>
                        <p className="text-slate-400">Add some questions to get started!</p>
                    </div>
                </div>
            ) : (
                <div className="overflow-y-auto pr-2 -mr-2 space-y-4">
                    <ul className="space-y-3">
                        {bank.questions.map((q, index) => (
                            <li key={q.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="prose prose-sm dark:prose-invert max-w-none flex-grow">
                                        <div className="flex gap-1 font-semibold text-slate-800 dark:text-slate-200">
                                            <span>{index + 1}.</span>
                                            <RichText text={q.text} />
                                        </div>
                                        <ul className="list-none p-0 mt-2 space-y-1">
                                            {renderQuestionContent(q)}
                                        </ul>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="secondary" onClick={() => setEditingQuestion(q)}><EditIcon/></Button>
                                        <Button variant="danger" onClick={() => handleDeleteQuestion(q.id)}><TrashIcon/></Button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <Modal isOpen={showAddQuestions} onClose={() => setShowAddQuestions(false)} title={`Add Questions to "${bank.name}"`}>
                <AddQuestions onQuestionsAdded={handleQuestionsAdded} />
            </Modal>

            {editingQuestion && (
                <Modal isOpen={!!editingQuestion} onClose={() => setEditingQuestion(null)} title="Edit Question">
                    <QuestionEditor
                        question={editingQuestion}
                        onSave={handleSaveQuestion}
                        onCancel={() => setEditingQuestion(null)}
                    />
                </Modal>
            )}
        </div>
    );
}

export default QuestionBankManager;