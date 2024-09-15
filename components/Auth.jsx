"use client";
import React, { useState, useEffect } from "react";
import SignUpForm from "./SignUp";
import SignInForm from "./SignIn";
import ProductForm from "./ProductForm";
// import { Tabs, TabsNav, Tab, TabsPanel, Text } from "landing-page-ui";

const Auth = ({children}) => {
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
				{/* <Tabs
					active={1}
					styles="relative"
					navWrapStyles="flex items-end text-sm"
					panelWrapStyles="border border-gray-500 p-2 h-24 overflow-y-auto rounded-b-xl rounded-tr-xl">
					<TabsNav activeTabStyles="!font-semibold">
						<Tab
							value={1}
							styles=" border border-gray-500 border-b-0 px-3 py-1 font-thin focus:outline-none rounded-tl-md ">
							New Product 
						</Tab>
						<Tab
							value={2}
							styles=" border border-gray-500 border-b-0 px-3 py-1 font-thin focus:outline-none">
							All Products
						</Tab>
						<Tab
							value={3}
							styles=" border border-gray-500 border-b-0 px-3 py-1 font-thin focus:outline-none rounded-tr-md">
							Contact
						</Tab>
					</TabsNav>
					<TabsPanel value={1}>
						<Text styles="text-xs text-gray-500 line-clamp-3">
							This is the text for Tab1. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo
							consequat. Duis aute irure dolor in reprehenderit in voluptate
							velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
							occaecat cupidatat non proident, sunt in culpa qui officia
							deserunt mollit anim id est laborum.
						</Text>
					</TabsPanel>
					<TabsPanel value={2}>
						<Text styles="text-xs text-gray-500 line-clamp-3">
							This is the text for Tab2. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo
							consequat. Duis aute irure dolor in reprehenderit in voluptate
							velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
							occaecat cupidatat non proident, sunt in culpa qui officia
							deserunt mollit anim id est laborum.
						</Text>
					</TabsPanel>
					<TabsPanel value={3}>
						<Text styles="text-xs text-gray-500 line-clamp-3">
							This is the text for Tab3. Lorem ipsum dolor sit amet, consectetur
							adipiscing elit, sed do eiusmod tempor incididunt ut labore et
							dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
							exercitation ullamco laboris nisi ut aliquip ex ea commodo
							consequat. Duis aute irure dolor in reprehenderit in voluptate
							velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint
							occaecat cupidatat non proident, sunt in culpa qui officia
							deserunt mollit anim id est laborum.
						</Text>
					</TabsPanel>
				</Tabs> */}
				{/* <ProductForm user={userData} /> */}
				{children}
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
