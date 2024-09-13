"use client";
import React, { useState, useEffect } from "react";
import SignUpForm from "./SignUp";
import SignInForm from "./SignIn";
import ProductForm from "./ProductForm";

const Auth = () => {
	const [isSignedUp, setIsSignedUp] = useState(false);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if the user is signed in on component mount
		const userData = localStorage.getItem("inventory");
		if (userData) {
			setIsSignedIn(true);
		}
    setLoading(false);
	}, []);

	const handleSignUpSuccess = () => {
		setIsSignedUp(true);
    setLoading(false);
	};

	const handleSignInSuccess = () => {
		setIsSignedIn(true);
    setLoading(false);
	};

	const handleSignOut = () => {
		// Set loading state to true while signing out
		setLoading(true);

		// Clear all user data from local storage
		localStorage.removeItem("inventory");

		// Update state to reflect that the user has signed out
		setIsSignedIn(false);

		// Set loading state back to false
		setLoading(false);
	};

	if (loading) {
		return <p>Loading...</p>;
	}

	if (isSignedIn) {
		const userData = JSON.parse(localStorage.getItem("inventory"));
		const userEmail = userData ? userData.email : "User";

		return (
			<div>
				<h2>Welcome, {userEmail}!</h2>
				<button onClick={handleSignOut}>Sign Out</button>
				<ProductForm user={userData} />
			</div>
		);
	}

	return (
		<div>
			{!isSignedIn && !isSignedUp ? (
				<>
					<SignUpForm onSignUpSuccess={handleSignUpSuccess} />
					<button onClick={() => setIsSignedUp(true)}>Sign In</button>
				</>
			) : (
				<>
					<SignInForm onSignInSuccess={handleSignInSuccess} />
					<button onClick={() => setIsSignedUp(false)}>Sign Up</button>
				</>
			)}
		</div>
	);
};

export default Auth;
