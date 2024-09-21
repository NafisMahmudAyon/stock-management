"use client";
import React, { useEffect, useState } from "react";
import DummyImage from "@/image/dummy-product-image.jpg";
import Image from "next/image";
import Select from "react-select";
import axios from "axios";
import { supabase } from "./createClient";
import { useRouter } from "next/navigation";

const DashboardAllProducts = ({ product, userData }) => {
	const [updateProduct, setUpdateProduct] = useState(product);
	console.log(product);
	const [categories, setCategories] = useState([]);
	const [quickEdit, setQuickEdit] = useState(false);
	const [apiKey, setApiKey] = useState("");
	console.log(quickEdit);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const fetchApiKey = async () => {
			try {
				// Ensure userData has an email
				if (!userData?.email) {
					throw new Error("User email not available");
				}

				// Fetch the API key from Supabase
				const { data: userDatas, error: userError } = await supabase
					.from("users")
					.select("api")
					.eq("email", userData.email) // userData?.email is now validated
					.single();

				// Check for errors or empty data
				if (userError || !userDatas || !userDatas.api) {
					throw new Error("Error retrieving API key");
				}

				// Set the API key state
				const apiKey = userDatas.api;
				setApiKey(apiKey); // Make sure setApiKey is defined in your state
			} catch (error) {
				console.error("Failed to retrieve API key:", error);
				alert(error.message);
			}
		};
		if (userData?.email) {
			fetchApiKey(); // Call the function to fetch the API key when the component mounts
		}
	}, [userData]); // Make sure userData is properly populated before this effect runs

	useEffect(() => {
		const fetchCategories = async () => {
			try {
				const response = await fetch("/api/categories");
				const data = await response.json();
				if (data.error) {
					console.error("Error fetching categories:", data.error);
				} else {
					setCategories(
						data.map((cat) => ({
							value: cat.id,
							label: cat.name,
						}))
					);
				}
			} catch (error) {
				console.error("Error fetching categories:", error);
			}
		};
		fetchCategories();
	}, []);
	const titleTruncate = (title, maxLength = 80) => {
		// Check if the title length exceeds the maximum length
		if (title.length > maxLength) {
			// Truncate the title and add ellipsis
			return title.substring(0, maxLength) + "...";
		}
		// Return the original title if it's within the limit
		return title;
	};
	const handleInputChange = (e) => {
		const { name, value } = e.target;

		setUpdateProduct((prev) => ({
			...prev,
			[name]:
				name === "price" ||
				name === "regular_price" ||
				name === "sale_price" ||
				name === "stock_quantity"
					? parseFloat(value) // Handle numeric values
					: value,
		}));
	};
	const handleCategoryChange = (selectedOptions) => {
		setUpdateProduct((prev) => ({
			...prev,
			categories: selectedOptions.map((option) => option.value),
		}));
	};
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		if (updateProduct === product) {
			// Only proceed if the objects are not strictly equal
			console.log("No Change Detected");
			return;
		}

		// Compare the relevant properties explicitly
		if (
			updateProduct.name === product.name &&
			updateProduct.price === product.price &&
			updateProduct.regular_price === product.regular_price &&
			updateProduct.sale_price === product.sale_price &&
			updateProduct.stock_quantity === product.stock_quantity
		) {
			console.log("No Change Detected");
			return;
		}
		console.log(updateProduct);
		const variations = updateProduct.variations; // Assuming `updateProduct.variations` contains the updated variation data
		for (let i = 0; i < variations.length; i++) {
			let variation = {
				...variations[i],
				price:
					variations[i].price === ""
						? product.price
						: parseFloat(variations[i].price), // Convert price to a number
				sale_price:
					variations[i].sale_price === ""
						? product.sale_price
						: parseFloat(variations[i].sale_price), // Convert sale_price to a number
				product_id: updateProduct.id, // Ensure the product ID is included
				attributes: JSON.stringify(variations[i].attributes), // Ensure attributes are JSON serialized
			};

			console.log(variation); // Optional: Check the variation data in the console

			// Send a PUT request to update the variation
			try {
				const responseVariation = await axios.put(
					`/api/products/${updateProduct.id}/variations`, // Variation ID is required to identify which variation to update
					variation, // Send the variation data with updated fields
					{
						headers: {
							Authorization: `Bearer ${apiKey}`, // Attach the API key again
							"Content-Type": "application/json",
						},
					}
				);

				// Check if the variation was successfully updated
				if (responseVariation.status === 200) {
					console.log("Variation updated successfully", responseVariation.data);
				} else {
					console.error("Error updating variation", responseVariation.data);
				}
			} catch (error) {
				console.error(`Error updating variation ${variation.id}`, error);
			}
		}
		setUpdateProduct((prev) => ({
			...prev,
			variations: variations,
		}));
		console.log(updateProduct);
		try {
			const response = await axios.put(
				`/api/products/${product.id}`,
				updateProduct,
				{
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				}
			);
			console.log(response);
			if (response.status === 200) {
				alert("Product updated successfully");
				setLoading(false);
				setQuickEdit(false);
				router.push("/all-products");
			}
		} catch (error) {
			console.error("Failed to update product", error);
			alert("Error updating product.");
		}
	};
	return (
		<div
			className={`${quickEdit ? "border-b-[1px] border-typography " : "border-b-[1px] border-transparent"}`}>
			<div
				className={`group flex  text-sm gap-4 px-2 ${quickEdit ? "border-b" : ""}`}>
				<div className="w-[60px] h-[80px] flex items-center justify-center ">
					{product.images ? (
						<Image
							className="object-contain w-[60px] h-[60px] "
							src={product.images[0]}
							alt={product.name}
							width={60}
							height={60}
							loading="lazy"
						/>
					) : (
						<Image src={DummyImage} alt="dummy image" />
					)}
				</div>
				<div className="flex items-center flex-1 gap-4">
					<div className="flex-1 relative flex items-center h-full">
						<p className="truncate  ">
							{titleTruncate(updateProduct.name)}
							{/* {product.name} */}
						</p>
						<div className="group-hover:flex hidden items-center text-xs gap-3 mt-2 transition-all duration-300 ease-in-out absolute bottom-2 ">
							<a
								href={`/product/edit/${product.id}`}
								className="px-2 bg-gray-700 py-[2px] rounded-sm shadow-sm transition-all duration-300 ease-in-out">
								Edit
							</a>
							<button
								onClick={() => setQuickEdit(true)}
								className="px-2 bg-gray-700 py-[2px] rounded-sm shadow-sm transition-all duration-300 ease-in-out">
								Quick Edit
							</button>
						</div>
					</div>
					<div>{updateProduct.sku ? updateProduct.sku : "-"}</div>
					<div>{updateProduct.type}</div>
					<div>{updateProduct.stock_status}</div>
					<div>
						{updateProduct.sale_price == 0 ? (
							updateProduct.price
						) : (
							<span>
								<span className="line-through ">{updateProduct.price}</span> -{" "}
								{updateProduct.sale_price}{" "}
							</span>
						)}
						{/* {product.price} */}
					</div>
					<div>
						{updateProduct.categories.length > 0 &&
							updateProduct.categories.map((category, index) => {
								const cat = categories.find((cat) => cat.value == category);
								return (
									<span key={index}>
										{cat?.label}{" "}
										{updateProduct.categories.length == index + 1 ? "" : ","}{" "}
									</span>
								);
							})}
					</div>
					<div>{updateProduct.status}</div>
				</div>
			</div>
			{quickEdit && (
				<div className="relative">
					{/* {console.log("hello")} */}
					{loading && (
						<div className="absolute inset-0 backdrop-blur-[1px] z-20 flex items-center justify-center bg-[#88acbc]/20">
							<svg
								class="animate-spin -ml-1 mr-3 size-10 text-white"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24">
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="blue"
									stroke-width="3"></circle>
								<path
									class="opacity-75"
									fill="indigo"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</div>
					)}
					<div className="text-center text-2xl font-semibold my-3 ">Quick Edit</div>
					<form onSubmit={handleSubmit}>
						<div className="flex flex-col">
							<label className="text-sm ">Name:</label>
							<input
								type="text"
								name="name"
								value={updateProduct.name}
								onChange={handleInputChange}
							/>
						</div>
						<div>
							<label>Slug:</label>
							<input
								type="text"
								name="slug"
								value={updateProduct.slug}
								onChange={handleInputChange}
							/>
						</div>
						<select
							name="type"
							value={updateProduct.type}
							onChange={handleInputChange}
							className="p-2 border border-gray-300 rounded w-full mb-4">
							<option value="single">Single</option>
							<option value="variable">Variable</option>
						</select>
						<select
							name="status"
							value={updateProduct.status}
							onChange={handleInputChange}
							className="p-2 border border-gray-300 rounded w-full mb-4">
							<option value="draft">Draft</option>
							<option value="published">Published</option>
							<option value="unpublished">Unpublished</option>
						</select>

						<div>
							<label>Price:</label>
							<input
								type="number"
								name="price"
								value={updateProduct.price}
								onChange={handleInputChange}
							/>
						</div>
						<input
							type="text"
							name="sku"
							value={updateProduct.sku}
							onChange={handleInputChange}
							placeholder="SKU"
							className="p-2 border border-gray-300 rounded w-full mb-4"
						/>

						<input
							type="number"
							name="regular_price"
							value={updateProduct.regular_price}
							onChange={handleInputChange}
							placeholder="Regular Price"
							className="p-2 border border-gray-300 rounded w-full mb-4"
						/>

						<input
							type="number"
							name="sale_price"
							value={updateProduct.sale_price}
							onChange={handleInputChange}
							placeholder="Sale Price"
							className="p-2 border border-gray-300 rounded w-full mb-4"
						/>

						<select
							name="stock_status"
							value={updateProduct.stock_status}
							onChange={handleInputChange}
							className="p-2 border border-gray-300 rounded w-full mb-4">
							<option value="instock">In Stock</option>
							<option value="outofstock">Out of Stock</option>
						</select>

						<input
							type="number"
							name="stock_quantity"
							value={updateProduct.stock_quantity}
							onChange={handleInputChange}
							placeholder="Stock Quantity"
							className="p-2 border border-gray-300 rounded w-full mb-4"
						/>

						<div>
							<label className="block mb-2">Categories</label>
							<Select
								isMulti
								options={categories}
								value={categories.filter((category) =>
									updateProduct.categories.includes(category.value.toString())
								)}
								onChange={handleCategoryChange}
								className="mb-4"
							/>
						</div>
						<button type="submit">Update Product</button>
						<button onClick={() => setQuickEdit(false)}>Cancel</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default DashboardAllProducts;
