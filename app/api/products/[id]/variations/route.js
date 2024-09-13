import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient';
import { verifyApiKey } from '@/app/api/utils/verifyApiKey';

export async function POST(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const variation = await request.json();
    const { data, error } = await supabase.from('product_variations').insert([{ product_id: productId, ...variation }]);
    if (error) return NextResponse.json({ error: 'Failed to add variation' }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const variationId = params.id;
    const updates = await request.json();
    const { data, error } = await supabase.from('product_variations').update(updates).eq('id', variationId);
    if (error) return NextResponse.json({ error: 'Failed to update variation' }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const variationId = params.id;
    const { error } = await supabase.from('product_variations').delete().eq('id', variationId);
    if (error) return NextResponse.json({ error: 'Failed to delete variation' }, { status: 500 });
    return NextResponse.json({ message: 'Variation deleted' });
}
