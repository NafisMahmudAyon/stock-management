import { NextResponse } from 'next/server';
import { supabase } from '@/components/createClient';
import { verifyApiKey } from '../utils/verifyApiKey';

export async function POST(request) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const product = await request.json();
  console.log(product)
	const { data, error } = await supabase
		.from("products")
		.insert([product])
		.select("id");
	if (error)
		return NextResponse.json(
			{ error: "Failed to create product" },
			{ status: 500 }
		);
	return NextResponse.json(data);
}

export async function GET(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
    if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(data);
}

export async function PUT(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const updates = await request.json();
    const { data, error } = await supabase.from('products').update(updates).eq('id', productId);
    if (error) return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!(await verifyApiKey(apiKey))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productId = params.id;
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    return NextResponse.json({ message: 'Product deleted' });
}
