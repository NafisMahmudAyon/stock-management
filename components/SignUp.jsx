"use client";
import React, { useState } from "react";

const SignUpForm = ({ onSignUpSuccess }) => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [userName, setUserName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const handleSignUp = async (e) => {
		e.preventDefault();

		if (!firstName || !lastName || !userName || !email || !password) {
			setError("All fields are required.");
			return;
		}

		try {
			const response = await fetch("/api/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName,
					lastName,
					userName,
					email,
					password,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setSuccessMessage(
					`Sign up successful! Your API key is: ${result.apiKey}`
				);
				if (onSignUpSuccess) {
					onSignUpSuccess();
				}
			} else {
				setError(result.error || "Failed to sign up. Please try again.");
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
			{successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
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
