import { v4 as uuidv4 } from "uuid"; // Import uuid for generating unique keys
import { supabase } from "@/components/createClient";

export async function POST(request) {
	const { username, email, password } = await request.json();

	if (!username || !email || !password) {
		return new Response(JSON.stringify({ error: "All fields are required" }), {
			status: 400,
		});
	}

	try {
		// Generate a unique API key
		const apiKey = uuidv4();

		// Hash the password (assuming you handle password hashing elsewhere)
		const { data: user, error: insertError } = await supabase
			.from("users")
			.insert([{ username, email, password_hash: password, api_key: apiKey }]);

		if (insertError) {
			return new Response(JSON.stringify({ error: insertError.message }), {
				status: 500,
			});
		}

		return new Response(JSON.stringify({ user, apiKey }), { status: 201 });
	} catch (error) {
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
