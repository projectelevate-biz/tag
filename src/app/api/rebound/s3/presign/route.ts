import { NextResponse } from 'next/server';
import { createS3UploadFields } from '@/lib/s3/createS3UploadFields';
import { getPresignedUrl } from '@/lib/s3/getPresignedUrl';
import { auth } from '@/auth';

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { filename, contentType } = await req.json();
    const key = `rebound/${session.user.id}/${Date.now()}-${filename}`;

    try {
        const data = await createS3UploadFields({ path: key, contentType });
        return NextResponse.json({ url: data.url, fields: data.fields, key });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'No key' }, { status: 400 });

    try {
        const url = await getPresignedUrl(key);
        return NextResponse.json({ url });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
