
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    let response;
    if (imageFile) {
        const imagePart = await fileToGenerativePart(imageFile);
        response = await model.generateContent([prompt, imagePart]);
    } else {
        response = await model.generateContent(prompt);
    }

    const result = await response.response;
    const text = result.text();

    const assistantResponse = {
      sender: 'assistant',
      text: text,
      createdAt: new Date(),
    };

    return NextResponse.json(assistantResponse);

  } catch (error) {
    console.error('Error in Gemini generate endpoint:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
