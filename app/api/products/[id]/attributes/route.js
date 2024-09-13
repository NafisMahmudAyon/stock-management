import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient';
import { verifyApiKey } from '@/app/api/utils/verifyApiKey';

export async function POST(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const { name } = await request.json();
    const { data, error } = await supabase.from('attributes').insert([{ product_id: productId, name }]);
    if (error) return NextResponse.json({ error: 'Failed to add attribute' }, { status: 500 });
    return NextResponse.json(data);
}
