import { supabase } from "@/components/createClient";

export async function GET() {
	try {
		const { data, error } = await supabase.from("categories").select("*");

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
			});
		}

		return new Response(JSON.stringify(data), { status: 200 });
	} catch (error) {
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}

export async function POST(request) {
	const { name, parent_id, level } = await request.json();

	if (!name || level === undefined) {
		return new Response(
			JSON.stringify({ error: "Name and level are required" }),
			{ status: 400 }
		);
	}

	try {
		const { data, error } = await supabase
			.from("categories")
			.insert([{ name, parent_id, level }]);

		if (error) {
			return new Response(JSON.stringify({ error: error.message }), {
				status: 500,
			});
		}

		return new Response(JSON.stringify(data), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
