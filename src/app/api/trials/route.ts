
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDB from '@/lib/db';
import Trial from '@/models/trial.model';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const trials = await Trial.find({ userId: session.user.id }).sort({ createdAt: -1 });
    return NextResponse.json(trials);
  } catch (error) {
    console.error('Error fetching trials:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const body = await req.json();
    const name = body.name || `New Trial ${new Date().toLocaleString()}`;

    const newTrial = new Trial({
      userId: session.user.id,
      name: name,
      messages: [],
    });
    await newTrial.save();
    return NextResponse.json(newTrial, { status: 201 });
  } catch (error) {
    console.error('Error creating new trial:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
