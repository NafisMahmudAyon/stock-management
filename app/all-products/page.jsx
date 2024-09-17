"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/components/createClient";
import axios from "axios";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableRow,
} from "landing-page-ui";
import Image from "next/image";
import DashboardAllProducts from "@/components/DashboardAllProducts";

const Page = () => {
	const [userData, setUserData] = useState(null);
	const [loading, setLoading] = useState(true); // State to manage loading
	const [isSignedIn, setIsSignedIn] = useState(false); // State to manage signed-in status
	const [products, setProducts] = useState([]);
	console.log(products)
	const [productsLoading, setProductsLoading] = useState(false); // State to manage products loading

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

	useEffect(() => {
		const fetchProducts = async () => {
			if (!userData?.email) return;

			setProductsLoading(true);

			try {
				const { data: userDatas, error: userError } = await supabase
					.from("users")
					.select("api")
					.eq("email", userData.email)
					.single();

				if (userError || !userDatas) {
					throw new Error("Error retrieving API key");
				}

				const apiKey = userDatas.api;
				const response = await axios.get("/api/products", {
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				});

				if (response.status === 200) {
					setProducts(response.data);
				} else {
					console.error("Failed to fetch products");
				}
			} catch (error) {
				console.error("Error fetching products:", error);
			} finally {
				setProductsLoading(false);
			}
		};

		fetchProducts();
	}, [userData?.email]); // Only re-run if userData.email changes

	if (loading) {
		return <div>Loading...</div>; // Display a loading indicator while data is being fetched
	}

	return (
		<div>
			{/* Render ProductForm component with userData as prop */}
			{isSignedIn && (
				<>
					{productsLoading ? (
						<div>Loading products...</div>
					) : (
						<div>
							{/* Render products here */}
							{products.length ? (
								<>
									<Table variant="2">
										<TableHead>
											<TableRow>
												<TableCell header={true}>Image</TableCell>
												<TableCell header={true}>Name</TableCell>
												<TableCell header={true}>Type</TableCell>
												<TableCell header={true}>Sku</TableCell>
												<TableCell header={true}>Price</TableCell>
												<TableCell header={true}>Sale Price</TableCell>
												<TableCell header={true}>Actions</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											{products.map((product) => (
												<TableRow key={product.id}>
													<TableCell><Image src={product.images[1]} width={70} height={100} alt={product.name} /></TableCell>
													<TableCell styles="text-wrap max-w-96">{product.name}</TableCell>
													<TableCell>{product.type}</TableCell>
													<TableCell>{product.sku ? product.sku : "-"}</TableCell>
													<TableCell>{product.price}</TableCell>
													<TableCell>{product.sale_price}</TableCell>
													<TableCell>
														<a href={`/product/edit/${product.id}`}>Edit</a>
														<a href="#">Delete</a>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
									<ul>
										{products.map((product,index) => (
											<DashboardAllProducts product={product} key={index} />
										))}
									</ul>
								</>
							) : (
								<div>No products found.</div>
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

export default Page;
