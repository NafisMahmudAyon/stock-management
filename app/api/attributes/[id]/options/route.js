import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient';
import { verifyApiKey } from '@/app/api/utils/verifyApiKey';

export async function POST(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attributeId = params.id;
    const { optionValue } = await request.json();
    const { data, error } = await supabase.from('attribute_options').insert([{ attribute_id: attributeId, option_value: optionValue }]);
    if (error) return NextResponse.json({ error: 'Failed to add option' }, { status: 500 });
    return NextResponse.json(data);
}

export async function GET(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attributeId = params.id;
    const { data, error } = await supabase.from('attribute_options').select('*').eq('attribute_id', attributeId);
    if (error) return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    return NextResponse.json(data);
}
