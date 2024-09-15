import { NextResponse } from "next/server";
import { supabase } from "@/components/createClient";
import { verifyApiKey } from "../utils/verifyApiKey";

export async function POST(request) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const product = await request.json();
	console.log(product);
	const { data, error } = await supabase
		.from("products")
		.insert([product])
		.select("id");
	if (error) {
		console.log(error);
		return NextResponse.json(
			{ error: "Failed to create product" },
			{ status: 500 }
		);
	}
	return NextResponse.json(data);
}

// export async function GET(request, { params }) {
//     const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
//     if (!(await verifyApiKey(apiKey))) {
//         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const productId = params.id;
//     const { data, error } = await supabase.from('products').select('*').eq('id', productId).single();
//     if (error) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
//     return NextResponse.json(data);
// }

export async function GET(request) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");

	// Verify API key
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const { data: user, error } = await supabase
		.from("users")
		.select("id")
		.eq("api", apiKey)
		.single();

	if (error || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	// Get user_id from query params
	// const { searchParams } = new URL(request.url);
	// const userId = searchParams.get("user_id");

	console.log(user);

	const userId = user.id;

	if (!userId) {
		return NextResponse.json({ error: "user_id is required" }, { status: 400 });
	}


	// Fetch products for the user
	const { data: products, error: productsError } = await supabase
		.from("products")
		.select("*, product_images(image_url), product_variations(*)")
		.eq("user_id", userId);

	if (productsError) {
		return NextResponse.json(
			{ error: "Failed to fetch products" },
			{ status: 500 }
		);
	}

	// Format the products to match the React state structure
	const formattedProducts = products.map((product) => ({
        id: product.id,
		user_id: product.user_id,
		name: product.name,
		slug: product.slug,
		type: product.type,
		status: product.status,
		description: product.description,
		short_description: product.short_description,
		sku: product.sku,
		price: product.price,
		currency: product.currency || "USD",
		regular_price: product.regular_price,
		sale_price: product.sale_price,
		date_on_sale_from: product.date_on_sale_from
			? new Date(product.date_on_sale_from)
			: null,
		date_on_sale_to: product.date_on_sale_to
			? new Date(product.date_on_sale_to)
			: null,
		stock_status: product.stock_status,
		stock_quantity: product.stock_quantity,
		categories: product.categories || [],
		images: product.product_images?.map((image) => image.image_url) || [],
		variations:
			product.product_variations?.map((variation) => ({
				id: variation.id,
				sku: variation.sku,
				price: variation.price,
				sale_price: variation.sale_price,
				sale_price_start_date: variation.sale_price_start_date,
				sale_price_end_date: variation.sale_price_end_date,
				stock_quantity: variation.stock_quantity,
				attributes: variation.attributes ? JSON.parse(variation.attributes) : [],
			})) || [],
		average_rating: product.average_rating || "0",
		rating_count: product.rating_count || 0,
	}));

	return NextResponse.json(formattedProducts);
}

export async function PUT(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const productId = params.id;
	const updates = await request.json();
	const { data, error } = await supabase
		.from("products")
		.update(updates)
		.eq("id", productId);
	if (error)
		return NextResponse.json(
			{ error: "Failed to update product" },
			{ status: 500 }
		);
	return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const productId = params.id;
	const { error } = await supabase
		.from("products")
		.delete()
		.eq("id", productId);
	if (error)
		return NextResponse.json(
			{ error: "Failed to delete product" },
			{ status: 500 }
		);
	return NextResponse.json({ message: "Product deleted" });
}
