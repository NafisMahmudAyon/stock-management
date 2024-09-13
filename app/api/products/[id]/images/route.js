import { NextResponse } from 'next/server';
import { supabase } from '@/lib/createClient';
import { verifyApiKey } from '@/api/utils/verifyApiKey';

export async function POST(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const { imageUrl } = await request.json();
    const { data, error } = await supabase.from('product_images').insert([{ product_id: productId, image_url: imageUrl }]);
    if (error) return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId, imageId } = params;
    const { error } = await supabase.from('product_images').delete().eq('id', imageId);
    if (error) return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    return NextResponse.json({ message: 'Image deleted' });
}
