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
    const { messages, name } = await req.json();

    const updateData: { [key: string]: any } = {};
    if (messages) {
      updateData.messages = messages;
    }
    if (name) {
      updateData.name = name;
    }

    // Sanitize messages for logging if they exist
    if (messages) {
      const sanitizedMessages = messages.map(msg => {
          if (msg.imageUrl && msg.imageUrl.length > 100) {
              return { ...msg, imageUrl: msg.imageUrl.substring(0, 100) + '... [TRUNCATED]' };
          }
          return msg;
      });
      console.log("Received in PUT /api/trials/[id]:", JSON.stringify(sanitizedMessages, null, 2));
    }

    const updatedTrial = await Trial.findOneAndUpdate(
      { _id: context.params.id, userId: session.user.id },
      { $set: updateData },
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
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  try {
    const deletedTrial = await Trial.findOneAndDelete({ _id: context.params.id, userId: session.user.id });

    if (!deletedTrial) {
      return NextResponse.json({ message: 'Trial not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Trial deleted successfully' });
  } catch (error) {
    console.error('Error deleting trial:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
