import React from 'react';
import { useAppContext } from '../../App';
import { Button } from '../ui';
import { TrashIcon } from '../icons';

const ExamHistory: React.FC = () => {
    const { history, deleteHistory } = useAppContext();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Exam History</h1>
            
            {history.length === 0 ? (
                <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-lg text-slate-600 dark:text-slate-300">You haven't completed any exams yet.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-slate-50 dark:bg-slate-900/50">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Date</th>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Bank</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Score</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Points Earned</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Total Points</th>
                                    <th className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {history.map(result => (
                                    <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 text-sm whitespace-nowrap">{new Date(result.date).toLocaleString()}</td>
                                        <td className="p-4 text-sm font-medium whitespace-nowrap">{result.bankName}</td>
                                        <td className="p-4 text-sm text-center font-bold">
                                            <span className={`px-2 py-1 rounded-full text-xs ${result.score >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : result.score >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                                {result.score}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-center">{result.correctCount}</td>
                                        <td className="p-4 text-sm text-center">{result.totalQuestions}</td>
                                        <td className="p-4 text-sm text-center">
                                            <Button variant="danger" onClick={() => deleteHistory(result.id)}>
                                                <TrashIcon />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamHistory;