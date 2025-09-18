import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDB from '@/lib/db';
import User from '@/models/user.model';

// GET handler to fetch user profile
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const user = await User.findById(session.user.id).select('name email images');
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST handler to update user profile (images)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const formData = await req.formData();
    const newImageFiles = formData.getAll('newImages') as File[];
    const existingImagesString = formData.get('existingImages') as string | null;
    const existingImages = existingImagesString ? JSON.parse(existingImagesString) : [];

    let newImageUrls: string[] = [];
    for (const file of newImageFiles) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      newImageUrls.push(dataUrl);
    }

    const finalImages = [...existingImages, ...newImageUrls];

    if (finalImages.length > 3) {
      return NextResponse.json({ message: 'You can upload a maximum of 3 images.' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { images: finalImages } },
      { new: true }
    ).select('name email images');

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
