"use client";
import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "./createClient"; // Ensure createClient exports the initialized Supabase client

const SignInForm = ({ onSignInSuccess }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSignIn = async (e) => {
		e.preventDefault();

		if (!email || !password) {
			setError("Both fields are required.");
			return;
		}

		try {
			// Fetch the user with the given email
			const { data: user, error: fetchError } = await supabase
				.from("users")
				.select("id, first_name, last_name, password")
				.eq("email", email)
				.single();

			if (fetchError) {
				throw fetchError;
			}

			if (!user) {
				setError("Invalid email or password.");
				return;
			}

			// Compare the provided password with the stored hash
			const isPasswordMatch = await bcrypt.compare(
				password,
				user.password
			);

			if (!isPasswordMatch) {
				setError("Invalid email or password.");
				return;
			}

			// Save the user data to localStorage
			// localStorage.setItem({"inventory":{"userId": user.id, "email": email,first_name: user.first_name, last_name: user.last_name, "signed-in": true}});
			// localStorage.setItem("userId", user.id);
			// localStorage.setItem("email", email);
			// localStorage.setItem("firstName", user.first_name);
			// localStorage.setItem("lastName", user.last_name);

			const userData = {
				userId: user.id,
				email: email,
				first_name: user.first_name,
				last_name: user.last_name,
				"signed-in": true,
			};
			localStorage.setItem("inventory", JSON.stringify(userData));

			if (onSignInSuccess) {
				onSignInSuccess();
			}
		} catch (err) {
			console.error("Error signing in:", err);
			setError("Failed to sign in. Please try again.");
		}
	};

	return (
		<form onSubmit={handleSignIn}>
			<h2>Sign In</h2>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<input
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>
			<input
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
			/>
			<button type="submit">Sign In</button>
		</form>
	);
};

export default SignInForm;
