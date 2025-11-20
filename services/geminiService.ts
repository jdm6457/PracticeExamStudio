import { GoogleGenAI, Type } from "@google/genai";
import type { Question } from '../types';

const questionSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "The main text of the question. Preserve original newlines and formatting. For 'dropdown' type, use '{{dropdown}}' as a placeholder where the dropdown should appear in the text." },
    type: { type: Type.STRING, enum: ["single", "multiple", "dropdown", "drag_drop"], description: "The type of question. Use 'dropdown' for Hot Area/inline selects. Use 'drag_drop' for Select and Place/Drag Drop questions." },
    options: {
      type: Type.ARRAY,
      description: "For 'single'/'multiple': Answer choices. For 'drag_drop': The source list of items to be dragged.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "The option's label (e.g., 'A', 'B' or a simplified ID for drag items)." },
          text: { type: Type.STRING, description: "The text content of the option." }
        },
        required: ["label", "text"]
      }
    },
    dropdowns: {
      type: Type.ARRAY,
      description: "For 'dropdown' type only.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Label for the dropdown (used only if not inline)." },
          options: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Choices for this specific dropdown." },
          correctAnswer: { type: Type.STRING, description: "Correct choice." }
        },
        required: ["label", "options", "correctAnswer"]
      }
    },
    dropZones: {
        type: Type.ARRAY,
        description: "For 'drag_drop' type only. The list of target slots/boxes where items should be placed.",
        items: {
            type: Type.OBJECT,
            properties: {
                label: { type: Type.STRING, description: "Any text describing the specific slot, or empty string if just a box." }
            }
        }
    },
    correctAnswers: {
      type: Type.ARRAY,
      description: "For single/multiple: Array of correct labels. For dropdown: Array of correct strings. For drag_drop: Array of option LABELS (from the options array) that correspond to the dropZones in order.",
      items: {
        type: Type.STRING
      }
    },
    explanation: { type: Type.STRING, description: "An optional explanation for the correct answer." }
  },
  required: ["text", "type"]
};

const fullSchema = {
    type: Type.ARRAY,
    items: questionSchema,
};

const PROMPT_TEMPLATE = `You are an expert at parsing text content containing practice exam questions. Analyze the following text and extract all questions into a structured JSON format. 

Handle these question types:
1. **Single Choice**: Standard multiple choice with one correct answer.
2. **Multiple Choice**: Standard multiple choice with multiple correct answers.
3. **Dropdown / Hot Area**: Questions with inline dropdowns.
   - Type: "dropdown"
   - 'text': The full text/code. INSERT '{{dropdown}}' markers in the text exactly where the dropdowns should be.
   - 'dropdowns': Array of dropdown definitions. Order matches the {{dropdown}} markers.
4. **Drag and Drop / Select and Place**: Questions with a source list of values and a target area (Answer Area) with slots.
   - Type: "drag_drop"
   - 'options': The list of "Values" or draggable items. Assign simple labels if none exist (A, B, C...).
   - 'dropZones': The slots in the "Answer Area". Create one entry per slot.
   - 'correctAnswers': The array of 'options' LABELS that go into the slots, in order.

The text to parse is:
---
{{TEXT_CONTENT}}
---

Return ONLY a valid JSON array of question objects.`;

const IMAGE_PROMPT = `You are an expert at analyzing images of practice exam questions. Analyze the following image and extract all questions into a structured JSON format.

Handle these question types:
1. **Single Choice**: Standard multiple choice.
2. **Multiple Choice**: Multiple correct answers.
3. **Dropdown / Hot Area**: Inline dropdowns in text or tables.
   - If the image shows text/code with gaps for dropdowns, use "dropdown" type.
   - Set 'text' to the full content, using "{{dropdown}}" as the placeholder for each gap.
   - Populate 'dropdowns' array in order.
4. **Drag and Drop / Select and Place**: 
   - Typically shows a list of "Values" (left) and an "Answer Area" (right) with empty boxes.
   - Type: "drag_drop"
   - 'options': Extract all draggable boxes from the "Values" side. Give them labels (A, B, C...).
   - 'dropZones': Extract the empty slots from the "Answer Area".
   - 'correctAnswers': Determine the correct mapping based on your knowledge. Return an array of the correct Option Labels corresponding to the drop zones in order.

Identify the question text, options, correct answers, and any explanation. Preserve formatting. Return ONLY a valid JSON array.`;

const addIds = (questions: any[]): Question[] => {
    return questions.map(q => ({ 
        ...q, 
        id: crypto.randomUUID(),
        options: q.options || [],
        correctAnswers: q.correctAnswers || [],
        dropdowns: q.dropdowns || [],
        dropZones: q.dropZones || []
    }));
};

export const parseTextForQuestions = async (text: string): Promise<Question[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

        const prompt = PROMPT_TEMPLATE.replace('{{TEXT_CONTENT}}', text);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: fullSchema,
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        return addIds(jsonResponse);
    } catch (error) {
        console.error("Error parsing text with Gemini:", error);
        throw new Error("Failed to parse questions. The format might be unsupported or the API key may be invalid.");
    }
};

export const parseImageForQuestions = async (base64Image: string, mimeType: string): Promise<Question[]> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType
            }
        };

        const textPart = {
            text: IMAGE_PROMPT
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: fullSchema,
            }
        });
        
        const jsonResponse = JSON.parse(response.text);
        return addIds(jsonResponse);
    } catch (error) {
        console.error("Error parsing image with Gemini:", error);
        throw new Error("Failed to parse questions from image. The image may be unclear or the API key may be invalid.");
    }
};