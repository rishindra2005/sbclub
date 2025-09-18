import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Part, Content } from '@google/genai';

// Define the message interface locally to avoid model imports in API routes
interface IMessage {
  sender: 'user' | 'assistant';
  text?: string;
  imageUrl?: string;
  createdAt: Date;
}

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);

// Function to convert a file to a base64 string
async function fileToGenerativePart(file: File) {
  const base64EncodedData = Buffer.from(await file.arrayBuffer()).toString("base64");
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const imageFiles = formData.getAll('image') as File[];
    const prompt = formData.get('prompt') as string;
    const historyString = formData.get('history') as string | null;

    if (!prompt) {
        return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const modelName = "gemini-2.5-flash-image-preview";

    // Build the history
    const contents: Content[] = [];
    if (historyString) {
        const history: IMessage[] = JSON.parse(historyString);
        for (const message of history) {
            const parts: Part[] = [];
            if (message.text) {
                parts.push({ text: message.text });
            }
            if (message.imageUrl) {
                // Parse the data URL
                const match = message.imageUrl.match(/^data:(image\/.+);base64,(.+)$/);
                if (match) {
                    parts.push({
                        inlineData: {
                            mimeType: match[1],
                            data: match[2],
                        }
                    });
                }
            }
            contents.push({
                role: message.sender === 'assistant' ? 'model' : 'user',
                parts: parts,
            });
        }
    }

    // Add the current message
    const currentUserParts: Part[] = [{ text: prompt }];
    if (imageFiles.length > 0) {
      for (const imageFile of imageFiles) {
        const imagePart = await fileToGenerativePart(imageFile);
        currentUserParts.push(imagePart);
      }
    }
    contents.push({ role: 'user', parts: currentUserParts });


    const response = await genAI.models.generateContent({
        model: modelName,
        contents: contents,
    });

    let text = '';
    let imageUrl = '';

    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            } else if (part.inlineData) {
                const imageData = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                imageUrl = `data:${mimeType};base64,${imageData}`;
            }
        }
    }

    const assistantResponse = {
      sender: 'assistant',
      text: text,
      imageUrl: imageUrl,
      createdAt: new Date(),
    };

    return NextResponse.json(assistantResponse);

  } catch (error) {
    console.error('Error in Gemini generate endpoint:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}