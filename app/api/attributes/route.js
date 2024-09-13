import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient';
import { verifyApiKey } from '../utils/verifyApiKey';

export async function GET(request) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase.from('attributes').select('*');
    if (error) return NextResponse.json({ error: 'Failed to fetch attributes' }, { status: 500 });
    return NextResponse.json(data);
}
