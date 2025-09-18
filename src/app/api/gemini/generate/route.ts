import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Part } from '@google/genai';

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
    const imageFile = formData.get('image') as File | null;
    const prompt = formData.get('prompt') as string;

    if (!prompt) {
        return NextResponse.json({ message: 'Prompt is required' }, { status: 400 });
    }

    const modelName = "gemini-2.5-flash-image-preview";
    const parts: Part[] = [{ text: prompt }];

    if (imageFile) {
      const imagePart = await fileToGenerativePart(imageFile);
      parts.push(imagePart);
    }

    const response = await genAI.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts }],
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
