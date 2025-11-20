import React, { useMemo } from 'react';
import type { Question, QuestionBank, UserAnswer } from '../../types';
import { Button, RichText } from '../ui';
import { CheckIcon, XIcon } from '../icons';

interface ExamResultsProps {
    bank: QuestionBank;
    questions: Question[];
    userAnswers: UserAnswer;
    revealedAnswers: string[];
    onRestart: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({ bank, questions, userAnswers, revealedAnswers, onRestart }) => {
    const { earnedPoints, totalPoints, score } = useMemo(() => {
        let earned = 0;
        let max = 0;
        
        questions.forEach(q => {
            const userAns = userAnswers[q.id] || [];
            const correctAns = q.correctAnswers;
            
            if (q.type === 'drag_drop') {
                 // Count points for each drop zone
                 const zones = q.dropZones?.length || 0;
                 max += zones;
                 
                 let qEarned = 0;
                 for (let i = 0; i < zones; i++) {
                     if (userAns[i] === correctAns[i]) {
                         qEarned++;
                     }
                 }
                 earned += qEarned;
            } else if (q.type === 'dropdown') {
                 // Count points for each dropdown menu
                 const drops = q.dropdowns?.length || 0;
                 max += drops;

                 let qEarned = 0;
                 for (let i = 0; i < drops; i++) {
                     if (userAns[i] === correctAns[i]) {
                         qEarned++;
                     }
                 }
                 earned += qEarned;
            } else if (q.type === 'multiple') {
                 // Count points for each correct selection
                 max += correctAns.length;
                 
                 let qEarned = 0;
                 userAns.forEach(ans => {
                     if (correctAns.includes(ans)) {
                         qEarned++;
                     }
                 });
                 earned += qEarned;
            } else {
                // All or nothing for Single Choice
                max += 1;
                let isCorrect = false;
                // Single choice logic
                isCorrect = userAns.length === correctAns.length && userAns.every(ans => correctAns.includes(ans));
                if (isCorrect) earned++;
            }
        });
        
        const score = max > 0 ? Math.round((earned / max) * 100) : 0;
        return { earnedPoints: earned, totalPoints: max, score };
    }, [questions, userAnswers]);

    const renderInlineDropdownResult = (q: Question, idx: number, userAns: string[]) => {
        const uVal = userAns[idx] || "(No answer)";
        const cVal = q.correctAnswers[idx];
        const dropCorrect = uVal === cVal;
        
        return (
             <span key={idx} className="inline-block align-middle mx-1 my-1">
                 <span className={`px-2 py-1 rounded text-sm font-bold border ${dropCorrect ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800' : 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800 line-through'}`}>
                    {uVal}
                 </span>
                 {!dropCorrect && (
                    <span className="ml-1 px-2 py-1 rounded text-sm font-bold border bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
                        {cVal}
                    </span>
                 )}
             </span>
        );
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Exam Results: {bank.name}</h1>
                    <p className={`text-xl font-semibold mt-1 ${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>You scored {score}%</p>
                </div>
                <Button onClick={onRestart}>Take Another Exam</Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-4xl font-bold text-green-500">{earnedPoints}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Points Earned</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-4xl font-bold text-red-500">{totalPoints - earnedPoints}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Points Missed</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                    <p className="text-4xl font-bold text-blue-500">{revealedAnswers.length}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Answers Revealed</p>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Review Your Answers</h2>
                {questions.map((q, index) => {
                    const userAns = userAnswers[q.id] || [];
                    const correctAns = q.correctAnswers;
                    let isCorrect = false;

                    // Logic to determine if question header gets a "Check" or "X" (Perfect score vs imperfect)
                    if (q.type === 'dropdown') {
                         isCorrect = userAns.length === correctAns.length && userAns.every((ans, i) => ans === correctAns[i]);
                    } else if (q.type === 'drag_drop') {
                         isCorrect = userAns.length === correctAns.length && userAns.every((ans, i) => ans === correctAns[i]);
                    } else {
                         isCorrect = userAns.length === correctAns.length && userAns.every(ans => correctAns.includes(ans));
                    }
                    
                    const isInlineDropdown = q.type === 'dropdown' && q.text.match(/{{\s*dropdown\s*}}/i);

                    return (
                        <div key={q.id} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                            <div className="flex justify-between items-start gap-4">
                                <div className="font-semibold text-lg flex gap-1 w-full">
                                    <span>{index + 1}.</span>
                                    {isInlineDropdown ? (
                                         <div className="w-full font-mono text-base leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 overflow-x-auto">
                                            {q.text.split(/{{\s*dropdown\s*}}/i).map((part, i) => (
                                                <React.Fragment key={i}>
                                                    <span dangerouslySetInnerHTML={{__html: part}} />
                                                    {i < (q.text.match(/{{\s*dropdown\s*}}/gi)?.length || 0) && renderInlineDropdownResult(q, i, userAns)}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    ) : (
                                        <RichText text={q.text} />
                                    )}
                                </div>
                                {isCorrect ? <CheckIcon className="text-green-500 w-6 h-6 flex-shrink-0" /> : <XIcon className="text-red-500 w-6 h-6 flex-shrink-0" />}
                            </div>
                            
                            <div className="mt-4 space-y-2 text-base">
                                {/* Dropdown Result View (Non-Inline / Legacy) */}
                                {q.type === 'dropdown' && !isInlineDropdown && q.dropdowns && (
                                    <div className="mt-2 space-y-3">
                                        {q.dropdowns.map((drop, idx) => {
                                            const uVal = userAns[idx] || "(No answer)";
                                            const cVal = correctAns[idx];
                                            const dropCorrect = uVal === cVal;
                                            
                                            return (
                                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 flex justify-between items-center">
                                                    <div className="flex-grow">
                                                        <div className="text-sm font-medium mb-1">{drop.label}</div>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <span className={`px-2 py-1 rounded text-sm ${dropCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 line-through'}`}>
                                                                {uVal}
                                                            </span>
                                                            {!dropCorrect && (
                                                                <span className="px-2 py-1 rounded text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                    {cVal}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 font-bold text-sm">
                                                        {dropCorrect ? <span className="text-green-500">+1</span> : <span className="text-slate-300">0</span>}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Drag Drop Result View */}
                                {q.type === 'drag_drop' && q.dropZones && (
                                    <div className="mt-4">
                                        <p className="text-sm font-bold text-slate-500 uppercase mb-2">Placement Results (1 point per zone):</p>
                                        <div className="space-y-2">
                                            {q.dropZones.map((zone, idx) => {
                                                const userLabel = userAns[idx];
                                                const correctLabel = correctAns[idx];
                                                const isSlotCorrect = userLabel === correctLabel;
                                                
                                                const userText = q.options.find(o => o.label === userLabel)?.text || "(Empty)";
                                                const correctText = q.options.find(o => o.label === correctLabel)?.text || "Unknown";

                                                return (
                                                    <div key={idx} className="flex items-center gap-4 p-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                                        <div className="w-24 text-xs font-medium text-slate-400">{zone.label || `Zone ${idx+1}`}</div>
                                                        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            <div className={`${isSlotCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400 line-through'} text-sm`}>
                                                                {userText}
                                                            </div>
                                                            {!isSlotCorrect && (
                                                                <div className="text-green-600 dark:text-green-400 text-sm">
                                                                    <span className="font-bold mr-1">Correct:</span>{correctText}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="text-sm">
                                                            {isSlotCorrect ? <span className="text-green-500 font-bold">+1</span> : <span className="text-slate-300">0</span>}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Standard Options Result View (Single & Multiple) */}
                                {q.type !== 'dropdown' && q.type !== 'drag_drop' && q.options.map(opt => {
                                    const isUserSelection = userAns.includes(opt.label);
                                    const isCorrectAnswer = correctAns.includes(opt.label);
                                    let classes = "text-slate-700 dark:text-slate-300";
                                    if (isCorrectAnswer) classes = "text-green-600 dark:text-green-400 font-semibold";
                                    if (isUserSelection && !isCorrectAnswer) classes = "text-red-600 dark:text-red-400 line-through";
                                    
                                    return (
                                        <div key={opt.label} className={`flex items-center justify-between ${classes}`}>
                                            <div className="flex items-center">
                                                <span>{opt.label}) {opt.text}</span>
                                                {isUserSelection && <span className="ml-2 text-xs italic text-slate-500">(Your answer)</span>}
                                                {isCorrectAnswer && !isUserSelection && <span className="ml-2 text-xs italic text-green-500">(Correct answer)</span>}
                                            </div>
                                            {q.type === 'multiple' && (
                                                <div className="ml-2 font-bold text-sm">
                                                    {isUserSelection && isCorrectAnswer ? <span className="text-green-500">+1</span> : null}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                             {q.explanation && (
                                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm border-l-4 border-indigo-400">
                                    <p className="font-semibold mb-1">Explanation:</p>
                                    <RichText text={q.explanation} />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ExamResults;