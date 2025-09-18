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
    const prompt = `Please provide a detailed description of the outfit and the surrounding scene in the image, with a total length of approximately 500 words. 

**For the outfit, please analyze:**
- **Clothing Items:** Identify each piece of clothing worn by the person (e.g., shirt, pants, dress, jacket, etc.).
- **Style and Cut:** Describe the style of each garment (e.g., bohemian, minimalist, vintage, streetwear) and its cut (e.g., slim-fit, oversized, A-line).
- **Fabric and Texture:** Make an educated guess about the fabric of each item (e.g., cotton, denim, silk, wool) and its texture (e.g., smooth, ribbed, fuzzy).
- **Color and Patterns:** Detail the colors and any patterns or prints on the clothing.
- **Accessories:** Don't forget to mention any accessories like jewelry, bags, hats, or shoes.

**For the scene, please describe:**
- **Background:** What is in the background? Is it indoors or outdoors? A city street, a natural landscape, a room?
- **Lighting and Mood:** Describe the lighting (e.g., bright sunlight, soft indoor light, neon lights) and the overall mood or atmosphere it creates (e.g., cheerful, melancholic, energetic).
- **Composition:** How is the person placed in the frame? Are there any other interesting objects or elements in the scene?`;

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
