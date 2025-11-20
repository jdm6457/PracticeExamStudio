import React, { useState, useEffect } from 'react';
import type { Question, QuestionBank, UserAnswer } from '../../types';
import { useAppContext } from '../../App';
import { Button, Modal, RichText } from '../ui';
import { ChevronLeftIcon, ChevronRightIcon, FlagIcon, EyeIcon, CheckIcon } from '../icons';
import ExamResults from './ExamResults';

interface ExamRunnerProps {
    bank: QuestionBank;
    questions: Question[];
    onFinish: () => void;
}

const ExamRunner: React.FC<ExamRunnerProps> = ({ bank, questions, onFinish }) => {
    const { addResult, addToast } = useAppContext();
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer>({});
    const [flagged, setFlagged] = useState<string[]>([]);
    const [revealed, setRevealed] = useState<string[]>([]);
    const [showAnswer, setShowAnswer] = useState(false);
    const [startTime] = useState(Date.now());
    const [isFinished, setFinished] = useState(false);
    const [isSubmitModalOpen, setSubmitModalOpen] = useState(false);
    const [selectedDragItem, setSelectedDragItem] = useState<string | null>(null); // Label of selected item

    const currentQuestion = questions[currentQIndex];
    // For dropdowns/drag_drop, answer is string[]. For single/multiple, string[].
    const currentSelections = userAnswers[currentQuestion.id] || [];

    useEffect(() => {
      setShowAnswer(false);
      setSelectedDragItem(null);
    }, [currentQIndex]);

    // Handle Standard Single/Multiple Choice
    const handleOptionSelect = (optionLabel: string) => {
        if (showAnswer || currentQuestion.type === 'dropdown' || currentQuestion.type === 'drag_drop') return;
        
        const currentAnswers = userAnswers[currentQuestion.id] || [];
        let newAnswers: string[];

        if (currentQuestion.type === 'single') {
            newAnswers = [optionLabel];
        } else { // multiple
            const maxSelections = currentQuestion.correctAnswers.length > 0 ? currentQuestion.correctAnswers.length : currentQuestion.options.length;
            if (currentAnswers.includes(optionLabel)) {
                newAnswers = currentAnswers.filter(label => label !== optionLabel);
            } else {
                if (currentAnswers.length >= maxSelections) return;
                newAnswers = [...currentAnswers, optionLabel];
            }
        }
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: newAnswers }));
    };

    // Handle Dropdown Select
    const handleDropdownChange = (index: number, value: string) => {
        if (showAnswer || currentQuestion.type !== 'dropdown') return;
        
        const currentAnswers = [...(userAnswers[currentQuestion.id] || [])];
        // Ensure array is big enough
        while(currentAnswers.length <= index) currentAnswers.push('');
        
        currentAnswers[index] = value;
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswers }));
    };

    // Handle Drag & Drop
    const handleDragItemClick = (label: string) => {
        if (showAnswer) return;
        setSelectedDragItem(label === selectedDragItem ? null : label);
    };

    const handleDropZoneClick = (zoneIndex: number) => {
        if (showAnswer) return;
        
        const currentAnswers = [...(userAnswers[currentQuestion.id] || [])];
        // Ensure array size matches zones
        const zoneCount = currentQuestion.dropZones?.length || 0;
        while(currentAnswers.length < zoneCount) currentAnswers.push('');

        if (selectedDragItem) {
            // Place selected item into zone
            currentAnswers[zoneIndex] = selectedDragItem;
            setSelectedDragItem(null);
        } else {
            // If no item selected, clicking zone clears it
            currentAnswers[zoneIndex] = '';
        }
        setUserAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswers }));
    };

    const toggleFlag = () => {
        setFlagged(prev => prev.includes(currentQuestion.id) ? prev.filter(id => id !== currentQuestion.id) : [...prev, currentQuestion.id]);
    };
    
    const revealAnswer = () => {
        setShowAnswer(true);
        if(!revealed.includes(currentQuestion.id)){
            setRevealed(prev => [...prev, currentQuestion.id]);
        }
    };
    
    const handleSubmit = () => {
        const timeTaken = Math.round((Date.now() - startTime) / 1000);
        
        let earnedPoints = 0;
        let totalPoints = 0;
        
        questions.forEach(q => {
            const userAns = userAnswers[q.id] || [];
            const correctAns = q.correctAnswers;
            
            if (q.type === 'drag_drop') {
                 // For Drag & Drop: 1 point per drop zone
                 const zones = q.dropZones?.length || 0;
                 totalPoints += zones;
                 
                 let qEarned = 0;
                 for(let i = 0; i < zones; i++) {
                     if (userAns[i] === correctAns[i]) {
                         qEarned++;
                     }
                 }
                 earnedPoints += qEarned;
            } else if (q.type === 'dropdown') {
                 // For Dropdown: 1 point per dropdown menu
                 const dropdowns = q.dropdowns?.length || 0;
                 totalPoints += dropdowns;

                 let qEarned = 0;
                 for(let i = 0; i < dropdowns; i++) {
                     if (userAns[i] === correctAns[i]) {
                         qEarned++;
                     }
                 }
                 earnedPoints += qEarned;
            } else if (q.type === 'multiple') {
                 // For Multiple Choice: 1 point per correct selection
                 // Total points is the number of correct answers available
                 const correctCount = correctAns.length;
                 totalPoints += correctCount;

                 let qEarned = 0;
                 userAns.forEach(ans => {
                     if (correctAns.includes(ans)) {
                         qEarned++;
                     }
                 });
                 earnedPoints += qEarned;
            } else {
                 // For Single Choice: 1 point total (all or nothing)
                 totalPoints += 1;
                 
                 if (userAns.length > 0 && correctAns.includes(userAns[0])) {
                     earnedPoints += 1;
                 }
            }
        });

        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
        const resultId = crypto.randomUUID();

        addResult({
            id: resultId,
            bankId: bank.id,
            bankName: bank.name,
            date: new Date().toISOString(),
            score,
            timeTaken,
            totalQuestions: totalPoints, // Storing Total Points instead of Question Count for history accuracy
            correctCount: earnedPoints, // Storing Earned Points
            incorrectCount: totalPoints - earnedPoints,
            userAnswers,
            revealedAnswers: revealed,
            flaggedQuestions: flagged
        });
        
        setFinished(true);
        setSubmitModalOpen(false);
        addToast(`Exam finished! Your score is ${score}%.`, "success");
    };
    
    if (isFinished) {
        return <ExamResults bank={bank} questions={questions} userAnswers={userAnswers} revealedAnswers={revealed} onRestart={onFinish}/>;
    }

    // Calculate unanswered logic including dropdowns/dragdrop
    const unansweredCount = questions.filter(q => {
        const ans = userAnswers[q.id] || [];
        if (q.type === 'dropdown') {
            return ans.length < (q.dropdowns?.length || 0) || ans.includes('');
        }
        if (q.type === 'drag_drop') {
            return ans.length < (q.dropZones?.length || 0) || ans.includes('');
        }
        return ans.length === 0;
    }).length;
    
    // Has selection logic for "Next" button enabling
    const hasSelection = (() => {
        if (currentQuestion.type === 'dropdown' || currentQuestion.type === 'drag_drop') {
            return currentSelections.length > 0 && currentSelections.some(s => s !== '');
        }
        return currentSelections.length > 0;
    })();

    const renderDropdownWidget = (idx: number) => {
        const drop = currentQuestion.dropdowns?.[idx];
        if (!drop) return null;

        const userVal = currentSelections[idx] || "";
        const correctVal = currentQuestion.correctAnswers[idx];
        const isCorrect = userVal === correctVal;
        
        return (
            <span key={idx} className="inline-flex flex-col align-middle mx-1 my-1">
                <select 
                    value={userVal} 
                    onChange={(e) => handleDropdownChange(idx, e.target.value)}
                    disabled={showAnswer}
                    className={`block w-auto min-w-[140px] max-w-[250px] py-1 px-2 text-sm rounded border shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        showAnswer 
                            ? isCorrect 
                                ? 'bg-green-100 border-green-500 text-green-900'
                                : 'bg-red-100 border-red-500 text-red-900'
                            : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white'
                    }`}
                >
                    <option value="" disabled>Select...</option>
                    {drop.options.map((opt, oIdx) => (
                        <option key={oIdx} value={opt}>{opt}</option>
                    ))}
                </select>
                 {showAnswer && !isCorrect && (
                     <span className="text-[10px] font-bold text-green-600 dark:text-green-400 mt-0.5 px-1 bg-green-100 dark:bg-green-900/30 rounded self-start">
                         {correctVal}
                     </span>
                 )}
            </span>
        );
    };

    // Inline rendering logic for Dropdowns
    const isInlineDropdown = currentQuestion.type === 'dropdown' && currentQuestion.text.match(/{{\s*dropdown\s*}}/i);
    
    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{bank.name}</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">Question {currentQIndex + 1} of {questions.length}</p>
            </header>

            <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex-grow overflow-y-auto">
                
                {/* --- Inline Dropdown Content --- */}
                {isInlineDropdown ? (
                    <div className="mb-10 space-y-4">
                        <div className="font-mono text-base leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 overflow-x-auto">
                            {currentQuestion.text.split(/{{\s*dropdown\s*}}/i).map((part, i) => (
                                <React.Fragment key={i}>
                                    <span dangerouslySetInnerHTML={{__html: part}} />
                                    {i < (currentQuestion.text.match(/{{\s*dropdown\s*}}/gi)?.length || 0) && renderDropdownWidget(i)}
                                </React.Fragment>
                            ))}
                        </div>
                        {/* If there are more dropdown definitions than placeholders, render remaining below */}
                        {currentQuestion.dropdowns && currentQuestion.dropdowns.length > (currentQuestion.text.match(/{{\s*dropdown\s*}}/gi)?.length || 0) && (
                             <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded border border-yellow-100 text-sm text-yellow-800 dark:text-yellow-200">
                                 <strong>Note:</strong> Some dropdowns were not placed in the text.
                                 <div className="mt-2 space-y-2">
                                    {currentQuestion.dropdowns.slice((currentQuestion.text.match(/{{\s*dropdown\s*}}/gi)?.length || 0)).map((drop, offset) => {
                                        const idx = (currentQuestion.text.match(/{{\s*dropdown\s*}}/gi)?.length || 0) + offset;
                                        return (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="font-medium">{drop.label}:</span>
                                                {renderDropdownWidget(idx)}
                                            </div>
                                        )
                                    })}
                                 </div>
                             </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-10">
                         <RichText text={currentQuestion.text} className="text-lg font-normal text-slate-900 dark:text-slate-100 leading-relaxed" />
                    </div>
                )}
                
                {/* --- Legacy Dropdown / Hot Area UI (If NOT inline) --- */}
                {!isInlineDropdown && currentQuestion.type === 'dropdown' && currentQuestion.dropdowns && (
                    <div className="space-y-6 mb-8">
                        {currentQuestion.dropdowns.map((drop, idx) => {
                            const userVal = currentSelections[idx] || "";
                            const correctVal = currentQuestion.correctAnswers[idx];
                            const isCorrect = userVal === correctVal;
                            
                            return (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <label className="block mb-2 font-medium text-slate-700 dark:text-slate-300">{drop.label}</label>
                                    <div className="flex items-center gap-3">
                                        <select 
                                            value={userVal} 
                                            onChange={(e) => handleDropdownChange(idx, e.target.value)}
                                            disabled={showAnswer}
                                            className={`block w-full max-w-md p-2.5 text-base rounded-lg border ${
                                                showAnswer 
                                                    ? isCorrect 
                                                        ? 'bg-green-50 border-green-500 text-green-900 dark:bg-green-900/20 dark:text-green-300'
                                                        : 'bg-red-50 border-red-500 text-red-900 dark:bg-red-900/20 dark:text-red-300'
                                                    : 'bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500'
                                            }`}
                                        >
                                            <option value="" disabled>Select an option...</option>
                                            {drop.options.map((opt, oIdx) => (
                                                <option key={oIdx} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        {showAnswer && (
                                            isCorrect 
                                            ? <CheckIcon className="text-green-500 flex-shrink-0" />
                                            : <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                                                <span className="font-bold">Correct:</span> {correctVal}
                                              </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* --- Drag & Drop UI --- */}
                {currentQuestion.type === 'drag_drop' && currentQuestion.dropZones && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                         {/* Source Column */}
                         <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Values (Click to Select)</h3>
                             <div className="flex flex-col gap-2">
                                 {currentQuestion.options.map((opt) => {
                                     const isSelected = selectedDragItem === opt.label;
                                     const isPlaced = currentSelections.includes(opt.label);
                                     
                                     return (
                                         <button
                                             key={opt.label}
                                             onClick={() => handleDragItemClick(opt.label)}
                                             disabled={showAnswer}
                                             className={`p-3 rounded-lg text-left text-sm border transition-all ${
                                                 isSelected
                                                     ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:ring-indigo-800'
                                                     : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                                             } ${isPlaced ? 'opacity-50' : 'opacity-100'}`}
                                         >
                                             {opt.text}
                                         </button>
                                     );
                                 })}
                             </div>
                         </div>

                         {/* Target Column */}
                         <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                             <h3 className="font-bold text-sm uppercase text-slate-500 mb-4">Answer Area (Click Slot to Place)</h3>
                             <div className="flex flex-col gap-3">
                                 {currentQuestion.dropZones.map((zone, idx) => {
                                     const placedLabel = currentSelections[idx];
                                     const placedItem = currentQuestion.options.find(o => o.label === placedLabel);
                                     
                                     const isCorrect = placedLabel === currentQuestion.correctAnswers[idx];
                                     let borderColor = "border-slate-300 dark:border-slate-600";
                                     let bgColor = "bg-white dark:bg-slate-800";
                                     
                                     if (showAnswer) {
                                         if (isCorrect) {
                                             borderColor = "border-green-500";
                                             bgColor = "bg-green-50 dark:bg-green-900/20";
                                         } else {
                                             borderColor = "border-red-500";
                                             bgColor = "bg-red-50 dark:bg-red-900/20";
                                         }
                                     } else if (selectedDragItem) {
                                         borderColor = "border-indigo-400 border-dashed";
                                         bgColor = "bg-indigo-50 dark:bg-indigo-900/10";
                                     }

                                     return (
                                         <div key={idx} className="relative">
                                             {zone.label && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{zone.label}</p>}
                                             <div 
                                                 onClick={() => handleDropZoneClick(idx)}
                                                 className={`min-h-[3rem] p-3 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-between ${borderColor} ${bgColor}`}
                                             >
                                                 {placedItem ? (
                                                     <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">{placedItem.text}</span>
                                                 ) : (
                                                     <span className="text-xs text-slate-400 italic">Empty Slot</span>
                                                 )}
                                                 {placedItem && !showAnswer && (
                                                     <span className="text-xs text-red-400 hover:text-red-600 ml-2">✕</span>
                                                 )}
                                             </div>
                                             {showAnswer && !isCorrect && (
                                                 <div className="mt-1 text-xs text-green-600 dark:text-green-400 font-semibold">
                                                     Expected: {currentQuestion.options.find(o => o.label === currentQuestion.correctAnswers[idx])?.text || "Unknown"}
                                                 </div>
                                             )}
                                         </div>
                                     );
                                 })}
                             </div>
                         </div>
                     </div>
                )}

                {/* --- Standard Options UI --- */}
                {currentQuestion.type !== 'dropdown' && currentQuestion.type !== 'drag_drop' && (
                    <div className="space-y-6 mb-8">
                        {currentQuestion.options.map(option => {
                            const isChecked = currentSelections.includes(option.label);
                            const isCorrect = currentQuestion.correctAnswers.includes(option.label);
                            
                            let containerClass = "border-transparent bg-transparent";
                            let indicatorClass = "border-slate-300 dark:border-slate-600";
                            
                            if (showAnswer) {
                                if (isCorrect) {
                                    containerClass = "border-green-200 bg-green-50 dark:bg-green-900/20 rounded-lg";
                                    indicatorClass = "border-green-500 bg-green-500";
                                } else if (isChecked && !isCorrect) {
                                    containerClass = "border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg";
                                    indicatorClass = "border-red-500 bg-red-500";
                                } else {
                                    containerClass = "opacity-60";
                                }
                            } else {
                                if (isChecked) {
                                    indicatorClass = "border-indigo-600 bg-indigo-600";
                                } else {
                                    containerClass = "hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg";
                                }
                            }

                            return (
                                <div key={option.label} className={`transition-colors duration-200 border ${containerClass}`}>
                                    <label className={`relative flex items-start p-3 cursor-pointer`}>
                                        <div className="flex items-center h-6">
                                            <div className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 ${currentQuestion.type === 'single' ? 'rounded-full' : 'rounded'} ${indicatorClass}`}>
                                                {isChecked && !showAnswer && <div className={`w-2 h-2 bg-white ${currentQuestion.type === 'single' ? 'rounded-full' : 'rounded-sm'}`} />}
                                                {showAnswer && isCorrect && <div className={`w-2 h-2 bg-white ${currentQuestion.type === 'single' ? 'rounded-full' : 'rounded-sm'}`} />}
                                                {showAnswer && isChecked && !isCorrect && <div className={`w-2 h-2 bg-white ${currentQuestion.type === 'single' ? 'rounded-full' : 'rounded-sm'}`} />}
                                            </div>
                                            <input
                                                type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                                                name={currentQuestion.id}
                                                checked={isChecked}
                                                onChange={() => handleOptionSelect(option.label)}
                                                className="sr-only"
                                                disabled={showAnswer}
                                            />
                                        </div>
                                        <div className="ml-4 text-base text-slate-800 dark:text-slate-200">
                                            <span className="font-semibold mr-2">{option.label})</span>
                                            {option.text}
                                        </div>
                                    </label>
                                    {showAnswer && isCorrect && (
                                        <div className="pb-3 pl-3 ml-9 text-green-600 dark:text-green-400 font-bold text-sm flex items-center gap-1.5 animate-fade-in-up">
                                            <CheckIcon className="w-5 h-5 stroke-2" />
                                            This answer is correct.
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {showAnswer && currentQuestion.explanation && (
                    <div className="mt-8 p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/50 animate-fade-in">
                        <h3 className="text-sm uppercase tracking-wide font-bold text-green-800 dark:text-green-400 mb-3">Explanation</h3>
                        <RichText text={currentQuestion.explanation} className="text-slate-800 dark:text-slate-200 leading-relaxed" />
                    </div>
                )}
            </div>

            <footer className="mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="secondary" onClick={toggleFlag} className="flex-1 sm:flex-none justify-center">
                        <FlagIcon className={flagged.includes(currentQuestion.id) ? 'text-yellow-500 fill-yellow-500' : ''} />
                        <span className="ml-1">Flag</span>
                    </Button>
                     <Button variant="secondary" onClick={revealAnswer} disabled={showAnswer} className="flex-1 sm:flex-none justify-center">
                        <EyeIcon /> <span className="ml-1">Show Answer</span>
                    </Button>
                </div>
                 <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button onClick={() => setCurrentQIndex(i => i - 1)} disabled={currentQIndex === 0} variant="secondary" className="flex-1 sm:flex-none justify-center">
                        <ChevronLeftIcon /> Prev
                    </Button>
                    <Button onClick={() => setCurrentQIndex(i => i + 1)} disabled={currentQIndex === questions.length - 1 || !hasSelection} variant="secondary" className="flex-1 sm:flex-none justify-center">
                        Next <ChevronRightIcon />
                    </Button>
                    <div className="hidden sm:block w-px h-8 bg-slate-300 dark:bg-slate-700 mx-2"></div>
                    <Button variant="primary" onClick={() => setSubmitModalOpen(true)} disabled={!hasSelection && unansweredCount === questions.length} className="flex-1 sm:flex-none justify-center">
                        Submit
                    </Button>
                </div>
            </footer>

            <Modal isOpen={isSubmitModalOpen} onClose={() => setSubmitModalOpen(false)} title="Submit Exam">
                <div className="py-2">
                    {unansweredCount > 0 ? (
                         <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-start gap-3">
                            <FlagIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                            <p>You have <span className="font-bold">{unansweredCount}</span> unanswered questions remaining.</p>
                        </div>
                    ) : (
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Are you sure you want to finish and submit your exam?</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setSubmitModalOpen(false)}>Keep Working</Button>
                        <Button variant="primary" onClick={handleSubmit}>Submit Exam</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ExamRunner;