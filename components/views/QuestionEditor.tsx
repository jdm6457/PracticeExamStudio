import React, { useState, useEffect, useRef } from 'react';
import type { Question, Option, DropdownItem, DropZone } from '../../types';
import { Button } from '../ui';
import { PlusIcon, TrashIcon, UploadIcon, XIcon } from '../icons';
import { fileToBase64 } from '../../services/fileUtils';

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionEditor: React.FC<QuestionEditorProps> = ({ question, onSave, onCancel }) => {
  const [editedQuestion, setEditedQuestion] = useState<Question>({ ...question });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditedQuestion({ ...question });
  }, [question]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedQuestion(prev => ({ ...prev, text: e.target.value }));
  };

  // --- Image Handlers ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await fileToBase64(file);
      // Add data prefix if missing (fileToBase64 usually returns just the base64 string in this project utils, 
      // but we need to check how it's being used. The utils provided returns raw base64 without prefix).
      // We need to prepend the mime type for the img src to work.
      const mimeType = file.type; 
      const fullBase64 = `data:${mimeType};base64,${base64}`;
      
      setEditedQuestion(prev => ({ ...prev, imageUrl: fullBase64 }));
    } catch (error) {
      console.error("Error uploading image", error);
      alert("Failed to upload image.");
    }
    
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = () => {
    setEditedQuestion(prev => ({ ...prev, imageUrl: undefined }));
  };

  // --- Standard Option Handlers (Shared by Single/Multiple/DragDrop as Source) ---
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editedQuestion.options];
    newOptions[index].text = value;
    setEditedQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const handleCorrectAnswerChange = (label: string) => {
    if (editedQuestion.type === 'single') {
      setEditedQuestion(prev => ({ ...prev, correctAnswers: [label] }));
    } else if (editedQuestion.type === 'multiple') {
      const newCorrectAnswers = editedQuestion.correctAnswers.includes(label)
        ? editedQuestion.correctAnswers.filter(l => l !== label)
        : [...editedQuestion.correctAnswers, label];
      setEditedQuestion(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
    }
  };
  
  const addOption = () => {
    const nextLabel = String.fromCharCode(65 + editedQuestion.options.length); // A, B, C...
    const newOption: Option = { label: nextLabel, text: '' };
    setEditedQuestion(prev => ({ ...prev, options: [...prev.options, newOption] }));
  };

  const removeOption = (index: number) => {
    const optionToRemove = editedQuestion.options[index];
    const newOptions = editedQuestion.options.filter((_, i) => i !== index);
    
    let newCorrectAnswers = editedQuestion.correctAnswers;
    if (editedQuestion.type !== 'drag_drop') {
         newCorrectAnswers = editedQuestion.correctAnswers.filter(l => l !== optionToRemove.label);
    }
    
    setEditedQuestion(prev => ({ ...prev, options: newOptions, correctAnswers: newCorrectAnswers }));
  };

  // --- Dropdown Handlers ---
  const handleDropdownLabelChange = (index: number, val: string) => {
    const newDropdowns = [...(editedQuestion.dropdowns || [])];
    newDropdowns[index].label = val;
    setEditedQuestion(prev => ({ ...prev, dropdowns: newDropdowns }));
  };

  const handleDropdownOptionsChange = (index: number, val: string) => {
    const opts = val.split(/[,\n]/).map(s => s.trim()).filter(s => s !== '');
    const newDropdowns = [...(editedQuestion.dropdowns || [])];
    newDropdowns[index].options = opts;
    setEditedQuestion(prev => ({ ...prev, dropdowns: newDropdowns }));
  };

  const handleDropdownCorrectChange = (index: number, val: string) => {
      const newCorrectAnswers = [...editedQuestion.correctAnswers];
      newCorrectAnswers[index] = val;
      setEditedQuestion(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
  };

  const addDropdown = () => {
      const newDropdown: DropdownItem = { label: 'New Section', options: ['Option 1', 'Option 2'] };
      setEditedQuestion(prev => ({
          ...prev,
          dropdowns: [...(prev.dropdowns || []), newDropdown],
          correctAnswers: [...prev.correctAnswers, 'Option 1']
      }));
  };

  const removeDropdown = (index: number) => {
      const newDropdowns = [...(editedQuestion.dropdowns || [])];
      newDropdowns.splice(index, 1);
      const newCorrectAnswers = [...editedQuestion.correctAnswers];
      newCorrectAnswers.splice(index, 1);
      setEditedQuestion(prev => ({ ...prev, dropdowns: newDropdowns, correctAnswers: newCorrectAnswers }));
  };

  // --- Drag & Drop Handlers ---
  const addDropZone = () => {
      const newZone: DropZone = { label: '' };
      setEditedQuestion(prev => ({
          ...prev,
          dropZones: [...(prev.dropZones || []), newZone],
          correctAnswers: [...prev.correctAnswers, ''] // Placeholder for correct answer mapping
      }));
  };

  const removeDropZone = (index: number) => {
      const newZones = [...(editedQuestion.dropZones || [])];
      newZones.splice(index, 1);
      const newCorrectAnswers = [...editedQuestion.correctAnswers];
      newCorrectAnswers.splice(index, 1);
      setEditedQuestion(prev => ({ ...prev, dropZones: newZones, correctAnswers: newCorrectAnswers }));
  };

  const handleDropZoneLabelChange = (index: number, val: string) => {
      const newZones = [...(editedQuestion.dropZones || [])];
      newZones[index].label = val;
      setEditedQuestion(prev => ({ ...prev, dropZones: newZones }));
  };

  const handleDragDropCorrectMapping = (zoneIndex: number, optionLabel: string) => {
      const newCorrectAnswers = [...editedQuestion.correctAnswers];
      newCorrectAnswers[zoneIndex] = optionLabel;
      setEditedQuestion(prev => ({ ...prev, correctAnswers: newCorrectAnswers }));
  };
  
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as 'single' | 'multiple' | 'dropdown' | 'drag_drop';
    let updates: Partial<Question> = { type: newType };
    
    if (newType === 'dropdown') {
        if (!editedQuestion.dropdowns) {
            updates.dropdowns = [];
            updates.correctAnswers = [];
        }
    } else if (newType === 'drag_drop') {
        if (!editedQuestion.dropZones) {
            updates.dropZones = [];
            updates.correctAnswers = []; // Will store array of Option Labels
        }
        // Ensure options exist for dragging source
        if (!editedQuestion.options) {
            updates.options = [];
        }
    } else {
        if (editedQuestion.type === 'dropdown' || editedQuestion.type === 'drag_drop') {
            updates.correctAnswers = [];
        }
    }

    setEditedQuestion(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      
      {/* Question Text & Image */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
             <label className="block text-sm font-medium">Question Text</label>
             {editedQuestion.type === 'dropdown' && (
                 <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Tip: Use <code>{`{{dropdown}}`}</code> to place dropdowns inline</span>
             )}
        </div>
        <textarea
          value={editedQuestion.text}
          onChange={handleTextChange}
          rows={5}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 font-mono text-sm"
          placeholder={editedQuestion.type === 'dropdown' ? "e.g. Code snippet...\nvar x = {{dropdown}};\nif (x) { {{dropdown}} }" : ""}
        />
        
        {/* Image Upload Section */}
        <div>
            <label className="block text-sm font-medium mb-2">Question Image (Optional)</label>
            {editedQuestion.imageUrl ? (
                <div className="relative inline-block group">
                    <img 
                        src={editedQuestion.imageUrl} 
                        alt="Question attachment" 
                        className="h-32 w-auto object-contain rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900"
                    />
                    <button 
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-colors"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-3">
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                    />
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-sm">
                        <UploadIcon className="w-4 h-4 mr-2" />
                        Upload Image
                    </Button>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Supports PNG, JPG, GIF</span>
                </div>
            )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Question Type</label>
        <select value={editedQuestion.type} onChange={handleTypeChange} className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600">
            <option value="single">Single Choice</option>
            <option value="multiple">Multiple Choice</option>
            <option value="dropdown">Dropdown / Hot Area</option>
            <option value="drag_drop">Drag & Drop / Select & Place</option>
        </select>
      </div>

      {/* Standard Single/Multiple Editor */}
      {(editedQuestion.type === 'single' || editedQuestion.type === 'multiple') && (
          <div>
            <label className="block text-sm font-medium mb-1">Options & Correct Answer</label>
            <div className="space-y-2">
              {editedQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type={editedQuestion.type === 'single' ? 'radio' : 'checkbox'}
                    name="correctAnswer"
                    checked={editedQuestion.correctAnswers.includes(option.label)}
                    onChange={() => handleCorrectAnswerChange(option.label)}
                    className={editedQuestion.type === 'single' ? 'form-radio' : 'form-checkbox'}
                  />
                  <span className="font-semibold">{option.label})</span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-grow p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                  />
                  <Button variant="danger" onClick={() => removeOption(index)}><TrashIcon/></Button>
                </div>
              ))}
              <Button variant="secondary" onClick={addOption}><PlusIcon/> Add Option</Button>
            </div>
          </div>
      )}

      {/* Dropdown Editor */}
      {editedQuestion.type === 'dropdown' && (
          <div>
             <label className="block text-sm font-medium mb-2">Dropdown Sections</label>
             <div className="space-y-4">
                 {editedQuestion.dropdowns?.map((drop, index) => (
                     <div key={index} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                         <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-sm">Dropdown #{index + 1}</span>
                            <button onClick={() => removeDropdown(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                         </div>
                         <div className="grid gap-3">
                             <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400">Label / Context (Optional if using inline markers)</label>
                                <input 
                                    type="text" 
                                    value={drop.label} 
                                    onChange={(e) => handleDropdownLabelChange(index, e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" 
                                    placeholder="e.g. In the Cloud App Security portal:"
                                />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400">Options (comma or newline separated)</label>
                                <textarea
                                    rows={2}
                                    value={drop.options.join('\n')} 
                                    onChange={(e) => handleDropdownOptionsChange(index, e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600" 
                                />
                             </div>
                             <div>
                                <label className="text-xs text-slate-500 dark:text-slate-400">Correct Answer</label>
                                <select 
                                    value={editedQuestion.correctAnswers[index] || ''} 
                                    onChange={(e) => handleDropdownCorrectChange(index, e.target.value)}
                                    className="w-full p-2 text-sm border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                >
                                    <option value="" disabled>Select correct answer</option>
                                    {drop.options.map((opt, idx) => (
                                        <option key={idx} value={opt}>{opt}</option>
                                    ))}
                                </select>
                             </div>
                         </div>
                     </div>
                 ))}
                 <Button variant="secondary" onClick={addDropdown}><PlusIcon/> Add Dropdown Section</Button>
             </div>
          </div>
      )}

      {/* Drag & Drop Editor */}
      {editedQuestion.type === 'drag_drop' && (
          <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <h3 className="font-bold text-sm mb-2 text-blue-800 dark:text-blue-300">1. Draggable Items (Source)</h3>
                  <div className="space-y-2 mb-2">
                      {editedQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="font-semibold text-xs w-6">{option.label})</span>
                          <input
                            type="text"
                            value={option.text}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            className="flex-grow p-1.5 text-sm border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                            placeholder="Value text..."
                          />
                          <button onClick={() => removeOption(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                      ))}
                  </div>
                  <Button variant="secondary" onClick={addOption} className="text-xs py-1"><PlusIcon className="w-3 h-3 mr-1"/> Add Item</Button>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <h3 className="font-bold text-sm mb-2 text-indigo-800 dark:text-indigo-300">2. Drop Zones (Target) & Correct Mapping</h3>
                  <div className="space-y-3 mb-2">
                      {editedQuestion.dropZones?.map((zone, index) => (
                        <div key={index} className="flex flex-col gap-2 p-3 bg-white dark:bg-slate-800 rounded border border-indigo-200 dark:border-indigo-700">
                          <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs">Zone {index + 1}</span>
                              <input
                                type="text"
                                value={zone.label || ''}
                                onChange={(e) => handleDropZoneLabelChange(index, e.target.value)}
                                className="flex-grow p-1.5 text-sm border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                                placeholder="Optional Label (e.g., Step 1)"
                              />
                              <button onClick={() => removeDropZone(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                              <label className="text-xs text-slate-500">Correct Item:</label>
                              <select
                                value={editedQuestion.correctAnswers[index] || ''}
                                onChange={(e) => handleDragDropCorrectMapping(index, e.target.value)}
                                className="flex-grow p-1.5 text-sm border rounded-md bg-slate-50 dark:bg-slate-700 border-slate-300 dark:border-slate-600"
                              >
                                  <option value="">Select correct draggable item...</option>
                                  {editedQuestion.options.map(opt => (
                                      <option key={opt.label} value={opt.label}>{opt.label}) {opt.text.substring(0, 30)}{opt.text.length > 30 ? '...' : ''}</option>
                                  ))}
                              </select>
                          </div>
                        </div>
                      ))}
                  </div>
                  <Button variant="secondary" onClick={addDropZone} className="text-xs py-1"><PlusIcon className="w-3 h-3 mr-1"/> Add Zone</Button>
              </div>
          </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Explanation (Optional)</label>
        <textarea
          value={editedQuestion.explanation || ''}
          onChange={(e) => setEditedQuestion(prev => ({ ...prev, explanation: e.target.value }))}
          rows={3}
          className="w-full p-2 border rounded-md bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"
          placeholder="Explain why the answer is correct..."
        />
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(editedQuestion)}>Save</Button>
      </div>
    </div>
  );
};

export default QuestionEditor;