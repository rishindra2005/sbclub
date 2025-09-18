import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenAI, Part } from '@google/genai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY!);

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

    if (!imageFile) {
      return NextResponse.json({ message: 'No image provided' }, { status: 400 });
    }

    const modelName = "gemini-2.5-flash-image-preview";
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = "Describe the outfit and the scene in this image in detail in 500 words.";

    const contents = [{ role: 'user', parts: [imagePart, { text: prompt }] }];

    const response = await genAI.models.generateContent({
        model: modelName,
        contents: contents,
    });

    let text = '';
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                text += part.text;
            }
        }
    }

    return NextResponse.json({ description: text });

  } catch (error) {
    console.error('Error in Gemini describe endpoint:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
