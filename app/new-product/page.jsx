"use client";
import React, { useEffect, useState } from "react";
import ProductForm from "@/components/ProductForm";

const Page = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true); // State to manage loading
	const [isSignedIn, setIsSignedIn] = useState(false); // State to manage signed-in status

	useEffect(() => {
		// Check if the user is signed in on component mount
		const storedUserData = localStorage.getItem("inventory");
		if (storedUserData) {
			const parsedUserData = JSON.parse(storedUserData);
			setUserData(parsedUserData);
			setIsSignedIn(true);
		}
		setLoading(false);
	}, []);

	if (loading) {
		return <div>Loading...</div>; // Display a loading indicator while data is being fetched
	}

	return (
		<div>
			{/* Render ProductForm component with userData as prop */}
			{isSignedIn && <ProductForm user={userData} />}
		</div>
	);
};

export default Page;
