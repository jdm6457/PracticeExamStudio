import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../../App';
import type { AppView, Question } from '../../types';
import { Button } from '../ui';
import ExamRunner from './ExamRunner';

interface TakeExamViewProps {
    onNavigate: (view: AppView) => void;
}

const TakeExamView: React.FC<TakeExamViewProps> = ({ onNavigate }) => {
    const { banks, activeBankId, addToast } = useAppContext();
    const [selectedBankId, setSelectedBankId] = useState<string | null>(activeBankId);
    const [rangeStart, setRangeStart] = useState<string>('1');
    const [rangeEnd, setRangeEnd] = useState<string>('1');
    const [examQuestions, setExamQuestions] = useState<Question[] | null>(null);

    const selectedBank = useMemo(() => banks.find(b => b.id === selectedBankId), [banks, selectedBankId]);

    useEffect(() => {
        if (selectedBank) {
            setRangeStart('1');
            setRangeEnd(selectedBank.questions.length.toString());
        }
    }, [selectedBank]);

    const startExam = () => {
        if (!selectedBank) {
            return;
        }
        
        const start = parseInt(rangeStart, 10);
        const end = parseInt(rangeEnd, 10);
        const max = selectedBank.questions.length;

        if (isNaN(start) || isNaN(end)) {
            addToast("Please enter valid question numbers.", "error");
            return;
        }

        if (start < 1 || start > max) {
            addToast(`Start question must be between 1 and ${max}.`, "error");
            return;
        }

        if (end < 1 || end > max) {
            addToast(`End question must be between 1 and ${max}.`, "error");
            return;
        }

        if (start > end) {
            addToast("Start question cannot be greater than end question.", "error");
            return;
        }

        // Use questions in original bank order (do not shuffle)
        // Slice based on range (converting 1-based input to 0-based index)
        let questionsForExam = selectedBank.questions.slice(start - 1, end);
        
        // Randomize options within each question
        const randomizedQuestions = questionsForExam.map(q => {
            // Skip randomization for dropdown and drag_drop questions to preserve correctAnswers structure
            // Randomization logic below assumes simple set-based correctness and breaks ordered answer mappings
            if (q.type === 'dropdown' || q.type === 'drag_drop') {
                return q;
            }

            // Map to temporary structure to track correctness
            const optionsWithStatus = q.options.map(opt => ({
                text: opt.text,
                isCorrect: q.correctAnswers.includes(opt.label)
            }));

            // Shuffle options
            const shuffledOptions = optionsWithStatus.sort(() => 0.5 - Math.random());

            // Reassign labels and rebuild correct answers
            const newOptions = shuffledOptions.map((opt, index) => ({
                label: String.fromCharCode(65 + index), // A, B, C...
                text: opt.text
            }));

            const newCorrectAnswers = shuffledOptions
                .map((opt, index) => opt.isCorrect ? String.fromCharCode(65 + index) : null)
                .filter((label): label is string => label !== null);

            return {
                ...q,
                options: newOptions,
                correctAnswers: newCorrectAnswers
            };
        });

        setExamQuestions(randomizedQuestions);
    };

    if (examQuestions && selectedBank) {
        return <ExamRunner bank={selectedBank} questions={examQuestions} onFinish={() => setExamQuestions(null)} />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Take an Exam</h1>
            
            {banks.length === 0 ? (
                <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-slate-600 dark:text-slate-300">No question banks available.</p>
                    <Button onClick={() => onNavigate('banks')} className="mt-4">Create a Bank</Button>
                </div>
            ) : (
                <div className="max-w-lg mx-auto p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg space-y-6">
                    <div>
                        <label htmlFor="bank-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Question Bank</label>
                        <select
                            id="bank-select"
                            value={selectedBankId || ''}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className="block w-full p-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                        >
                            <option value="" disabled>-- Select a bank --</option>
                            {banks.map(bank => (
                                <option key={bank.id} value={bank.id}>{bank.name} ({bank.questions.length} questions)</option>
                            ))}
                        </select>
                    </div>

                    {selectedBank && (
                         <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Question Range</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="range-start" className="sr-only">Start Question</label>
                                        <input
                                            type="number"
                                            id="range-start"
                                            value={rangeStart}
                                            onChange={(e) => setRangeStart(e.target.value)}
                                            min="1"
                                            max={selectedBank.questions.length}
                                            className="block w-full p-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-center"
                                            placeholder="Start"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-1">Start</p>
                                    </div>
                                    <span className="text-slate-400 font-bold">to</span>
                                    <div className="flex-1">
                                        <label htmlFor="range-end" className="sr-only">End Question</label>
                                        <input
                                            type="number"
                                            id="range-end"
                                            value={rangeEnd}
                                            onChange={(e) => setRangeEnd(e.target.value)}
                                            min="1"
                                            max={selectedBank.questions.length}
                                            className="block w-full p-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg text-center"
                                            placeholder="End"
                                        />
                                        <p className="text-xs text-center text-slate-500 mt-1">End</p>
                                    </div>
                                </div>
                                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
                                    Total available: {selectedBank.questions.length}
                                </div>
                             </div>
                        </div>
                    )}

                    <Button onClick={startExam} disabled={!selectedBank} className="w-full justify-center py-3 text-base">
                        Start Exam
                    </Button>
                </div>
            )}
        </div>
    );
};

export default TakeExamView;