"use client";
import React, { useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "./createClient";

const SignUpForm = ({ onSignUpSuccess }) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [userName, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSignUp = async (e) => {
		e.preventDefault();

		if (!firstName || !lastName || !userName || !email || !password) {
			setError("All fields are required.");
			return;
		}

		try {
			// Check if the email already exists
			const { data: existingUsers, error: fetchError } = await supabase
				.from("users")
				.select("id")
				.eq("email", email);

			if (fetchError) {
				throw fetchError;
			}

			if (existingUsers.length > 0) {
				setError("Email is already registered.");
				return;
			}

			// Hash the password
			const passwordHash = await bcrypt.hash(password, 10);

			// Insert user into Supabase
			const { data, error: insertError } = await supabase.from("users").insert([
				{
					first_name: firstName,
					last_name: lastName,
					user_name: userName,
					email,
					password: passwordHash,
				},
			]);

			if (insertError) {
				throw insertError;
			}

			// Handle successful sign-up
			if (onSignUpSuccess) {
				onSignUpSuccess();
			}
		} catch (err) {
			console.error("Error signing up:", err);
			setError("Failed to sign up. Please try again.");
		}
	};

	return (
		<form onSubmit={handleSignUp}>
			<h2>Sign Up</h2>
			{error && <p style={{ color: "red" }}>{error}</p>}
			<input
				type="text"
				placeholder="First Name"
				value={firstName}
				onChange={(e) => setFirstName(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Last Name"
				value={lastName}
				onChange={(e) => setLastName(e.target.value)}
				required
			/>
			<input
				type="text"
				placeholder="Username"
				value={userName}
				onChange={(e) => setUserName(e.target.value)}
				required
			/>
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
			<button type="submit">Sign Up</button>
		</form>
	);
};

export default SignUpForm;
