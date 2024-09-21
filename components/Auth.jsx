"use client";
import React, { useState, useEffect } from "react";
import SignUpForm from "./SignUp";
import SignInForm from "./SignIn";
import ProductForm from "./ProductForm";
import Sidebar from "./Sidebar";
import ThemeSwitcher from "./ThemeSwitcher";
import PageName from "./PageName";
// import { Tabs, TabsNav, Tab, TabsPanel, Text } from "landing-page-ui";






const Auth = ({ children }) => {
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
			<div className="relative bg-primary-bg text-typography ">
				<Sidebar userData={userData} hnadleLogOut={handleSignOut} />
				{/* <h2>Welcome, {userEmail}!</h2>
				<button onClick={handleSignOut}>Sign Out</button> */}
				<main className="ml-64  px-6 max-h-screen overflow-auto  ">
					<div className="font-[Expose-Bold] py-5 bg-secondary-bg flex items-center justify-between px-6 rounded-b-md shadow-sm mb-5">
						<div className="">
							<PageName />
						</div>
						<div className="flex items-center gap-2 ">
							<h4>
								{userData.first_name} {userData.last_name}
							</h4>
							<button onClick={handleSignOut}>Sign Out</button>
							<ThemeSwitcher />
						</div>
					</div>
					{children}
				</main>
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
