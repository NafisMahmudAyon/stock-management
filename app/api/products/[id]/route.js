import { NextResponse } from "next/server";
import { supabase } from "@/components/createClient";
import { verifyApiKey } from "../../utils/verifyApiKey";

export async function GET(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");

	// Verify API key
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get the user based on the API key
	const { data: user, error } = await supabase
		.from("users")
		.select("id")
		.eq("api", apiKey)
		.single();

	if (error || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const userId = user.id;

	const { id: productId } = params;

	if (!productId) {
		return NextResponse.json(
			{ error: "Product ID is required" },
			{ status: 400 }
		);
	}

	// Fetch the product by product_id and user_id to ensure ownership
	const { data: product, error: productError } = await supabase
		.from("products")
		.select("*, product_images(image_url), product_variations(*)")
		.eq("id", productId)
		.eq("user_id", userId)
		.single();

	if (productError || !product) {
		return NextResponse.json(
			{ error: "Product not found or unauthorized access" },
			{ status: 404 }
		);
	}

	// Format the product data to match the structure expected by the frontend
	const formattedProduct = {
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
				attributes: variation.attributes
					? JSON.parse(variation.attributes)
					: [],
			})) || [],
		average_rating: product.average_rating || "0",
		rating_count: product.rating_count || 0,
	};

	return NextResponse.json(formattedProduct);
}

export async function PUT(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
console.log(request)
console.log(params)
	// Verify API key
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Extract product id from URL params
	const { id: productId } = params;

	if (!productId) {
		return NextResponse.json(
			{ error: "Product ID is required" },
			{ status: 400 }
		);
	}

	// Parse the request body to get updated product data
	const body = await request.json();
	console.log(body)
	const {
		name,
		slug,
		type,
		status,
		description,
		short_description,
		sku,
		price,
		currency,
		regular_price,
		sale_price,
		date_on_sale_from,
		date_on_sale_to,
		stock_status,
		stock_quantity,
		categories,
		images,
		variations,
	} = body;

	// Get the user based on the API key
	const { data: user, error: userError } = await supabase
		.from("users")
		.select("id")
		.eq("api", apiKey)
		.single();

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const userId = user.id;

	// Ensure that the product belongs to the user
	const { data: existingProduct, error: existingProductError } = await supabase
		.from("products")
		.select("id")
		.eq("id", productId)
		.eq("user_id", userId)
		.single();

	if (existingProductError || !existingProduct) {
		return NextResponse.json(
			{ error: "Product not found or unauthorized access" },
			{ status: 404 }
		);
	}

	// Update the main product data in the `products` table
	const { error: productUpdateError } = await supabase
		.from("products")
		.update({
			name,
			slug,
			type,
			status,
			description,
			short_description,
			sku,
			price,
			currency,
			regular_price,
			sale_price,
			date_on_sale_from,
			date_on_sale_to,
			stock_status,
			stock_quantity,
			categories,
		})
		.eq("id", productId);

	if (productUpdateError) {
		return NextResponse.json(
			{ error: "Failed to update product" },
			{ status: 500 }
		);
	}

	// Handle images: First, delete all existing images, then insert new ones
	const { error: imageDeleteError } = await supabase
		.from("product_images")
		.delete()
		.eq("product_id", productId);

	if (imageDeleteError) {
		return NextResponse.json(
			{ error: "Failed to update images" },
			{ status: 500 }
		);
	}

	if (images && images.length > 0) {
		const imageData = images.map((url) => ({
			product_id: productId,
			image_url: url,
		}));

		const { error: imageInsertError } = await supabase
			.from("product_images")
			.insert(imageData);

		if (imageInsertError) {
			return NextResponse.json(
				{ error: "Failed to insert images" },
				{ status: 500 }
			);
		}
	}

	// Handle variations: First, delete existing variations, then insert updated ones
	const { error: variationsDeleteError } = await supabase
		.from("product_variations")
		.delete()
		.eq("product_id", productId);

	if (variationsDeleteError) {
		return NextResponse.json(
			{ error: "Failed to update variations" },
			{ status: 500 }
		);
	}

	if (variations && variations.length > 0) {
		for (let variation of variations) {
			const {
				id,
				sku,
				price,
				sale_price,
				sale_price_start_date,
				sale_price_end_date,
				stock_quantity,
				attributes,
			} = variation;

			// Insert each variation with related attributes
			const { data: insertedVariation, error: variationInsertError } =
				await supabase
					.from("product_variations")
					.insert({
						product_id: productId,
						sku,
						price,
						sale_price,
						sale_price_start_date,
						sale_price_end_date,
						stock_quantity,
					})
					.select()
					.single();

			if (variationInsertError || !insertedVariation) {
				return NextResponse.json(
					{ error: "Failed to insert variations" },
					{ status: 500 }
				);
			}

			// Insert related variation attributes
			if (attributes && attributes.length > 0) {
				const attributeData = attributes.map((attribute) => ({
					variation_id: insertedVariation.id,
					attribute_id: attribute.attribute_id,
					option_value: attribute.option_value,
				}));

				const { error: attributesInsertError } = await supabase
					.from("variation_attributes")
					.insert(attributeData);

				if (attributesInsertError) {
					return NextResponse.json(
						{ error: "Failed to insert variation attributes" },
						{ status: 500 }
					);
				}
			}
		}
	}

	// Return success response
	return NextResponse.json({ message: "Product updated successfully" });
}

export async function DELETE(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");

	// Verify API key
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Get the product ID from the URL params
	const { id: productId } = params;

	if (!productId) {
		return NextResponse.json(
			{ error: "Product ID is required" },
			{ status: 400 }
		);
	}

	// Get the user based on the API key
	const { data: user, error: userError } = await supabase
		.from("users")
		.select("id")
		.eq("api", apiKey)
		.single();

	if (userError || !user) {
		return NextResponse.json({ error: "User not found" }, { status: 404 });
	}

	const userId = user.id;

	// Ensure the product belongs to the user
	const { data: product, error: productError } = await supabase
		.from("products")
		.select("id")
		.eq("id", productId)
		.eq("user_id", userId)
		.single();

	if (productError || !product) {
		return NextResponse.json(
			{ error: "Product not found or unauthorized access" },
			{ status: 404 }
		);
	}

	// Delete associated product images
	const { error: imageDeleteError } = await supabase
		.from("product_images")
		.delete()
		.eq("product_id", productId);

	if (imageDeleteError) {
		return NextResponse.json(
			{ error: "Failed to delete product images" },
			{ status: 500 }
		);
	}

	// Delete associated product variations
	const { error: variationsDeleteError } = await supabase
		.from("product_variations")
		.delete()
		.eq("product_id", productId);

	if (variationsDeleteError) {
		return NextResponse.json(
			{ error: "Failed to delete product variations" },
			{ status: 500 }
		);
	}

	// Finally, delete the product itself
	const { error: productDeleteError } = await supabase
		.from("products")
		.delete()
		.eq("id", productId)
		.eq("user_id", userId);

	if (productDeleteError) {
		return NextResponse.json(
			{ error: "Failed to delete product" },
			{ status: 500 }
		);
	}

	// Return success response
	return NextResponse.json({ message: "Product deleted successfully" });
}