import React, { useState, useRef } from 'react';
import { useAppContext } from '../../App';
import type { QuestionBank } from '../../types';
import { Button } from '../ui';

const ImportExport: React.FC = () => {
    const { banks, setBanks, addToast } = useAppContext();
    const [bankToExport, setBankToExport] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const bank = banks.find(b => b.id === bankToExport);
        if (!bank) {
            addToast("Please select a bank to export.", "error");
            return;
        }

        const exportData = {
            bankName: bank.name,
            exportDate: new Date().toISOString(),
            questions: bank.questions,
        };

        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `${bank.name.replace(/\s+/g, '_')}-questions.json`;
        link.click();
        addToast(`Exported "${bank.name}" successfully.`, "success");
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                if (typeof result !== 'string') throw new Error("File could not be read");
                const importedData = JSON.parse(result);

                // Basic validation
                if (!importedData.bankName || !Array.isArray(importedData.questions)) {
                    throw new Error("Invalid JSON format for question bank.");
                }

                const newBank: QuestionBank = {
                    id: crypto.randomUUID(),
                    name: `${importedData.bankName} (Imported)`,
                    questions: importedData.questions,
                };
                
                setBanks([...banks, newBank]);
                addToast(`Successfully imported "${newBank.name}".`, "success");

            } catch (error) {
                addToast(error instanceof Error ? error.message : "Failed to import file.", "error");
            } finally {
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Import / Export</h1>

            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-4">Export a Question Bank</h2>
                <div className="flex items-end gap-4">
                    <div className="flex-grow">
                        <label htmlFor="export-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Bank</label>
                        <select
                            id="export-select"
                            value={bankToExport}
                            onChange={(e) => setBankToExport(e.target.value)}
                            className="block w-full p-2.5 text-base border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
                        >
                            <option value="">-- Select a bank --</option>
                            {banks.map(bank => <option key={bank.id} value={bank.id}>{bank.name}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleExport} disabled={!bankToExport}>Export as JSON</Button>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                 <h2 className="text-xl font-bold mb-2">Import a Question Bank</h2>
                 <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Upload a previously exported JSON file. This will create a new bank with the imported questions.</p>
                <input type="file" accept=".json" onChange={handleImport} className="hidden" ref={fileInputRef} />
                <Button onClick={() => fileInputRef.current?.click()}>
                    Import from JSON
                </Button>
            </div>
        </div>
    );
};

export default ImportExport;