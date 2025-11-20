import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAppContext } from '../../App';
import type { Question } from '../../types';
import { parseTextForQuestions, parseImageForQuestions } from '../../services/geminiService';
import { fileToBase64, extractTextFromPdf } from '../../services/fileUtils';
import { Button, Spinner, RichText } from '../ui';
import { UploadIcon, CheckIcon } from '../icons';

interface AddQuestionsProps {
    onQuestionsAdded: (questions: Question[]) => void;
}

const AddQuestions: React.FC<AddQuestionsProps> = ({ onQuestionsAdded }) => {
    const { addToast } = useAppContext();
    const [textInput, setTextInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

    const handleParse = useCallback(async (content: string, type: 'text' | 'image' | 'pdf', file?: File) => {
        setIsLoading(true);
        setParsedQuestions([]);
        try {
            let questions: Question[] = [];
            if (type === 'image' && file) {
                const base64 = await fileToBase64(file);
                questions = await parseImageForQuestions(base64, file.type);
            } else if (type === 'pdf' && file) {
                const text = await extractTextFromPdf(file);
                questions = await parseTextForQuestions(text);
            } else {
                questions = await parseTextForQuestions(content);
            }
            setParsedQuestions(questions);
            addToast(`${questions.length} questions parsed successfully.`, 'success');
        } catch (error) {
            addToast(error instanceof Error ? error.message : "An unknown error occurred.", "error");
        } finally {
            setIsLoading(false);
        }
    }, [addToast]);

    const handleTextParse = () => {
        if (!textInput.trim()) {
            addToast("Text input cannot be empty.", "error");
            return;
        }
        handleParse(textInput, 'text');
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            const fileType = file.type;
            if (fileType.startsWith('image/')) {
                handleParse('', 'image', file);
            } else if (fileType === 'application/pdf') {
                handleParse('', 'pdf', file);
            } else {
                addToast("Unsupported file type. Please upload an image or PDF.", "error");
            }
        }
    }, [handleParse, addToast]);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (isLoading) return;
            
            const items = e.clipboardData?.items;
            if (!items) return;

            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        e.preventDefault();
                        addToast("Image detected from clipboard. Parsing...", "info");
                        handleParse('', 'image', file);
                        return;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [handleParse, isLoading, addToast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'], 'application/pdf': ['.pdf'] },
        multiple: false
    });

    const handleConfirm = () => {
        onQuestionsAdded(parsedQuestions);
        setParsedQuestions([]);
        setTextInput('');
    };

    return (
        <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('text')} className={`${activeTab === 'text' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}>
                        Paste Text
                    </button>
                    <button onClick={() => setActiveTab('file')} className={`${activeTab === 'file' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm focus:outline-none`}>
                        Upload File
                    </button>
                </nav>
            </div>
            
            {activeTab === 'text' && (
                <div className="space-y-3">
                    <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} placeholder={`Paste questions here. e.g.\n\nQuestion: What is 2+2?\nA) 3\nB) 4\nCorrect Answer: B\nExplanation: 2 plus 2 is 4.\n\n(Tip: You can also paste an image directly from your clipboard using Ctrl+V)`} rows={8} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                    <div className="flex justify-between items-center">
                         <p className="text-xs text-slate-500 dark:text-slate-400">Supports Ctrl+V for images too.</p>
                        <Button onClick={handleTextParse} disabled={isLoading || !textInput.trim()}>
                            {isLoading ? <><Spinner size="sm" /> Parsing...</> : "Parse Text"}
                        </Button>
                    </div>
                </div>
            )}

            {activeTab === 'file' && (
                <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50'}`}>
                    <input {...getInputProps()} />
                    <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                        {isDragActive ? "Drop the file here..." : "Drag & drop an image or PDF, click to select, or paste (Ctrl+V)"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF, WebP, PDF</p>
                </div>
            )}

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                    <Spinner />
                    <p className="mt-4 text-slate-600 dark:text-slate-300">AI is parsing your questions...</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">This may take a moment.</p>
                </div>
            )}
            
            {parsedQuestions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Parsed Questions Preview ({parsedQuestions.length})</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md">
                        {parsedQuestions.map((q, i) => (
                             <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-md text-sm border border-slate-200 dark:border-slate-700">
                                <RichText text={q.text} className="font-bold" />
                                <ul className="pl-4 mt-1">
                                    {q.options.map(opt => (
                                        <li key={opt.label} className={q.correctAnswers.includes(opt.label) ? 'text-green-600 dark:text-green-400' : ''}>
                                            {opt.label}) {opt.text}
                                        </li>
                                    ))}
                                </ul>
                                {q.explanation && (
                                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic border-t border-slate-200 dark:border-slate-700 pt-1">
                                        <span className="font-semibold not-italic">Explanation:</span> 
                                        <RichText text={q.explanation} className="inline ml-1" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleConfirm}><CheckIcon /> Add to Bank</Button>
                </div>
            )}
        </div>
    );
};

export default AddQuestions;