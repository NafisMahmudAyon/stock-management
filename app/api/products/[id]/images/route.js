import { NextResponse } from "next/server";
import { supabase } from "@/components/createClient";
import { verifyApiKey } from "@/app/api/utils/verifyApiKey";

export async function POST(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const image = await request.json(); // image contains image_url and product_id
	console.log(image);

	const { data, error } = await supabase.from("product_images").insert([image]); // Insert the image with product_id
	if (error) {
		console.log("Insert error: ", error);
		return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
	}
	return NextResponse.json(data);
}

export async function DELETE(request, { params }) {
	const apiKey = request.headers.get("Authorization")?.replace("Bearer ", "");
	if (!(await verifyApiKey(apiKey))) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { id: imageId } = params; // Get the image ID from the params

	const { error } = await supabase
		.from("product_images")
		.delete()
		.eq("id", imageId); // Delete image by its ID

	if (error) {
		return NextResponse.json(
			{ error: "Failed to delete image" },
			{ status: 500 }
		);
	}

	return NextResponse.json({ message: "Image deleted successfully" });
}