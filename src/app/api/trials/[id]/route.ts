import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectToDB from '@/lib/db';
import Trial from '@/models/trial.model';

export async function GET(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const trial = await Trial.findOne({ _id: context.params.id, userId: session.user.id });

    if (!trial) {
      return NextResponse.json({ message: 'Trial not found' }, { status: 404 });
    }

    return NextResponse.json(trial);
  } catch (error) {
    console.error('Error fetching trial:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const { messages } = await req.json();
    console.log("Received in PUT /api/trials/[id]:", JSON.stringify(messages, null, 2));

    const updatedTrial = await Trial.findOneAndUpdate(
      { _id: context.params.id, userId: session.user.id },
      { $set: { messages: messages } },
      { new: true }
    );

    console.log("Updated trial in DB:", updatedTrial);

    if (!updatedTrial) {
      return NextResponse.json({ message: 'Trial not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTrial);
  } catch (error) {
    console.error('Error updating trial:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
    // TODO: Implement trial deletion
    return NextResponse.json({ message: 'Not Implemented' }, { status: 501 });
}
