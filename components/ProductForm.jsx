"use client";
import React, { useEffect, useState } from "react";
// import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles
import Select from "react-select";
import axios from "axios";
import { supabase } from "./createClient";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), {
	ssr: false,
});

const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

const ProductForm = ({ user }) => {
	console.log(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
	const [product, setProduct] = useState({
		user_id: user.userId,
		name: "",
		slug: "",
		type: "single",
		status: "draft",
		description: "",
		short_description: "",
		sku: "",
		price: 0,
		currency: "USD",
		regular_price: 0,
		sale_price: 0,
		date_on_sale_from: new Date(),
		date_on_sale_to: new Date(),
		stock_status: "instock",
		stock_quantity: 0,
		categories: [],
		// images: [],
		// attributes: [],
		// variations: [],
		// reviews_allowed: false,
		average_rating: "0",
		rating_count: 0,
	});

	console.log(product);
	
	const [images, setImages] = useState([]);
	console.log(images)
	const [attributes, setAttributes] = useState([]);
	console.log(attributes);
	const [variations, setVariations] = useState([]);
	console.log(variations);
	const [categories, setCategories] = useState([]);
	const [isSlugEdited, setIsSlugEdited] = useState(false);

	// Auto-generate slug from product name
	useEffect(() => {
		if (!isSlugEdited) {
			const slugifiedName = product.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, ""); // Remove leading/trailing dashes
			setProduct((prev) => ({ ...prev, slug: slugifiedName }));
		}
	}, [product.name, isSlugEdited]);

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

	// Handle input change for string, number, and select fields
	const handleChange = (e) => {
		const { name, value } = e.target;

		setProduct((prev) => ({
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

	// Handle manual slug change
	const handleSlugChange = (e) => {
		setIsSlugEdited(true);
		setProduct((prev) => ({ ...prev, slug: e.target.value }));
	};

	// Handle Rich Text change for description and short description
	const handleRichTextChange = (name, value) => {
		setProduct((prev) => ({
			...prev,
			[name]: value, // Set rich text HTML value
		}));
	};

	// Handle date change
	const handleDateChange = (name, date) => {
		setProduct((prev) => ({
			...prev,
			[name]: date,
		}));
	};

	// Handle category change
	const handleCategoryChange = (selectedOptions) => {
		setProduct((prev) => ({
			...prev,
			categories: selectedOptions.map((option) => option.value),
		}));
	};

	// Handle adding a new attribute
	const addAttribute = () => {
		setAttributes([...attributes, { id: Date.now(), name: "", options: [] }]);
	};

	// Handle deleting an attribute
	const deleteAttribute = (index) => {
		const newAttributes = attributes.filter((_, i) => i !== index);
		setAttributes(newAttributes);
	};

	// Handle adding a new option to an attribute
	const addAttributeOption = (attrIndex) => {
		const newAttributes = [...attributes];
		newAttributes[attrIndex].options.push("");
		setAttributes(newAttributes);
	};

	// Handle deleting an option from an attribute
	const deleteAttributeOption = (attrIndex, optIndex) => {
		const newAttributes = [...attributes];
		newAttributes[attrIndex].options.splice(optIndex, 1);
		setAttributes(newAttributes);
	};

	// Handle attribute change
	const handleAttributeChange = (attrIndex, field, value) => {
		const newAttributes = [...attributes];
		if (field === "name") {
			newAttributes[attrIndex].name = value;
		}
		setAttributes(newAttributes);
	};

	// Handle option change for an attribute
	const handleOptionChange = (attrIndex, optIndex, value) => {
		const newAttributes = [...attributes];
		newAttributes[attrIndex].options[optIndex] = value;
		setAttributes(newAttributes);
	};

	// Handle adding a manual variation
	const addManualVariation = () => {
		setVariations([
			...variations,
			{
				sku: "",
				price: "",
				sale_price: "", // Add sale_price
				sale_price_start_date: new Date(), // Add sale start date
				sale_price_end_date: new Date(), // Add sale end date
				stock_quantity: 0,
				attributes: attributes.map((attr) => ({
					name: attr.name,
					option: "",
				})),
			},
		]);
	};

	// Handle manual variation attribute selection
	const handleVariationAttributeChange = (variationIndex, attrIndex, value) => {
		const newVariations = [...variations];
		newVariations[variationIndex].attributes[attrIndex].option = value;
		setVariations(newVariations);
	};

	// Handle variation change
	const handleVariationChange = (index, field, value) => {
		const newVariations = [...variations];
		newVariations[index][field] = value;
		setVariations(newVariations);
	};

	const handleVariationDelete = (index) => {
		const newVariations = [...variations];
		newVariations.splice(index, 1);
		setVariations(newVariations);
	};

	// Handle auto-generation of variations
	const autoGenerateVariations = () => {
		const attributeCombinations = getCombinations(attributes);
		const newVariations = attributeCombinations.map((combination) => ({
			sku: "",
			price: "",
			sale_price: "", // Add sale_price
			sale_price_start_date: new Date(), // Add sale start date
			sale_price_end_date: new Date(), // Add sale end date
			stock_quantity: 0,
			attributes: combination,
		}));
		setVariations(newVariations);
	};

	// Handle image upload
	const handleImageUpload = async (event) => {
		const files = event.target.files;
		const uploadedImages = [];

		for (const file of files) {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", uploadPreset);

			try {
				const response = await axios.post(cloudinaryUploadUrl, formData);
				const imageUrl = response.data.secure_url;
				uploadedImages.push(imageUrl);
			} catch (error) {
				console.error("Error uploading image:", error);
			}
		}

		setImages((prevImages) => [...prevImages, ...uploadedImages]); // Update as a flat array
	};

	// Handle image delete
	const handleImageDelete = (index) => {
		const newImages = images.filter((_, i) => i !== index); // Use images state instead of product.images
		setImages(newImages);
	};

	// const handleSubmit = async (e) => {
	// 	e.preventDefault();
	// 	// onSubmit({ ...product, attributes, variations });
	// 	// const productData = {
	// 	// 	...product,
	// 	// 	attributes: attributes.map((attr) => ({
	// 	// 		name: attr.name,
	// 	// 		options: attr.options.filter((opt) => opt), // Remove empty options
	// 	// 	})),
	// 	// 	variations: variations.map((variation) => ({
	// 	// 		...variation,
	// 	// 		attributes: variation.attributes.filter((attr) => attr.option !== ""), // Only include selected attributes
	// 	// 	})),
	// 	// };
	// 	let { data, error } = await supabase
	// 		.from("users")
	// 		.select("api")
	// 		.eq("email", user.email)
	// 		.single();

	// 	console.log(data);
	// 	try {
	// 		// Make an API call to save the product
	// 		const responseProduct = await axios.post("/api/products", product, {
	// 			headers: {
	// 				Authorization: `Bearer ${data.api}`, // Attach the API key as a Bearer token
	// 				"Content-Type": "application/json",
	// 			},
	// 		});
	//     if (responseProduct.status === 200) {
	//       var id = responseProduct.data[0].id
	//       console.log(variations)
	//       for (var i = 0; i < variations.length; i++) {
	//       const id = responseProduct.data[0].id
	//       const responseVariation = await axios.post(`/api/products/${id}/variations`, {id, variations[i]}, {
	//       headers: {
	// 				Authorization: `Bearer ${data.api}`, // Attach the API key as a Bearer token
	// 				"Content-Type": "application/json",
	// 			},
	// 		})};
	//     if (responseVariation.status === 200) {
	// 			console.log("Product saved successfully", responseVariation.data);
	// 			// Optionally, reset the form or navigate to another page
	// 		} else {
	// 			console.error("Error saving product", responseVariation.data);
	// 		}
	//   }

	// 		// if (responseProduct.status === 200) {
	// 		// 	console.log("Product saved successfully", responseProduct.data);
	// 		// 	// Optionally, reset the form or navigate to another page
	// 		// } else {
	// 		// 	console.error("Error saving product", responseProduct.data);
	// 		// }
	// 	} catch (error) {
	// 		console.error("Error submitting form:", error);
	// 	}
	// };

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Get the API key from the user's Supabase data
			let { data: userData, error: userError } = await supabase
				.from("users")
				.select("api")
				.eq("email", user.email)
				.single();

			if (userError || !userData) {
				throw new Error("Error retrieving API key");
			}

			const apiKey = userData.api;

			// Make an API call to save the product
			const responseProduct = await axios.post("/api/products", product, {
				headers: {
					Authorization: `Bearer ${apiKey}`, // Attach the API key as a Bearer token
					"Content-Type": "application/json",
				},
			});

			// Check if the product was successfully saved
			if (responseProduct.status === 200 && responseProduct.data.length > 0) {
				const productId = responseProduct.data[0].id; // Get the product ID from the response
				console.log("Product saved successfully", responseProduct.data);

				// Loop through the image and send them to the API
				for (let i = 0; i < images.length; i++) {
					const image = {
						image_url: images[i],
						product_id: productId, // Add the product ID
					};
					console.log(image);

					const responseImage = await axios.post(
						`/api/products/${productId}/images`,
						image, // Send the image with the product ID
						{
							headers: {
								Authorization: `Bearer ${apiKey}`, // Attach the API key again
								"Content-Type": "application/json",
							},
						}
					);
					// Check if the image was successfully saved
					if (responseImage.status === 200) {
						console.log("Images saved successfully", responseImage.data);
					} else {
						console.error("Error saving variation", responseImage.data);
					}
				}
				// Loop through the variations and send them to the API
				for (let i = 0; i < variations.length; i++) {
					let variation = {
						...variations[i],
						price:
							variations[i].price == ""
								? product.price
								: parseFloat(variations[i].price), // Convert price to a number
						sale_price:
							variations[i].sale_price == ""
								? product.sale_price
								: parseFloat(variations[i].sale_price), // Convert sale_price to a number
						product_id: productId, // Add the product ID
						attributes: JSON.stringify(variations[i].attributes), // Ensure attributes are JSON serialized
					};
					console.log(variation);

					// Post each variation linked to the product ID
					const responseVariation = await axios.post(
						`/api/products/${productId}/variations`,
						variation, // Send the variation with the product ID
						{
							headers: {
								Authorization: `Bearer ${apiKey}`, // Attach the API key again
								"Content-Type": "application/json",
							},
						}
					);

					// Check if the variation was successfully saved
					if (responseVariation.status === 200) {
						console.log("Variation saved successfully", responseVariation.data);
					} else {
						console.error("Error saving variation", responseVariation.data);
					}
				}
			} else {
				console.error("Error saving product", responseProduct.data);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="p-6">
			<h2 className="text-2xl font-bold mb-4">Product Details</h2>
			<input
				type="text"
				name="name"
				value={product.name}
				onChange={handleChange}
				placeholder="Product Name"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>
			<input
				type="text"
				name="slug"
				value={product.slug}
				onChange={handleSlugChange}
				placeholder="Slug"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>
			<select
				name="type"
				value={product.type}
				onChange={handleChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="single">Single</option>
				<option value="variable">Variable</option>
			</select>

			<select
				name="status"
				value={product.status}
				onChange={handleChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="draft">Draft</option>
				<option value="published">Published</option>
				<option value="unpublished">Unpublished</option>
			</select>

			<h2 className="text-lg font-semibold mb-2">Description</h2>
			<ReactQuill
				value={product.description}
				onChange={(value) => handleRichTextChange("description", value)}
				className="mb-4"
			/>

			<h2 className="text-lg font-semibold mb-2">Short Description</h2>
			<ReactQuill
				value={product.short_description}
				onChange={(value) => handleRichTextChange("short_description", value)}
				className="mb-4"
			/>

			<input
				type="number"
				name="price"
				value={product.price}
				onChange={handleChange}
				placeholder="Price"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<input
				type="text"
				name="sku"
				value={product.sku}
				onChange={handleChange}
				placeholder="SKU"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<input
				type="number"
				name="regular_price"
				value={product.regular_price}
				onChange={handleChange}
				placeholder="Regular Price"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<input
				type="number"
				name="sale_price"
				value={product.sale_price}
				onChange={handleChange}
				placeholder="Sale Price"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<select
				name="stock_status"
				value={product.stock_status}
				onChange={handleChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="instock">In Stock</option>
				<option value="outofstock">Out of Stock</option>
			</select>

			<input
				type="number"
				name="stock_quantity"
				value={product.stock_quantity}
				onChange={handleChange}
				placeholder="Stock Quantity"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			{/* <input
				type="text"
				name="categories"
				value={product.categories.join(", ")}
				onChange={(e) =>
					setProduct({
						...product,
						categories: e.target.value.split(",").map((cat) => cat.trim()),
					})
				}
				placeholder="Categories (comma-separated)"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/> */}

			<label className="block mb-2">Categories</label>
			<Select
				isMulti
				options={categories}
				value={categories.filter((category) =>
					product.categories.includes(category.value)
				)}
				onChange={handleCategoryChange}
				className="mb-4"
			/>

			{/* Image upload */}
			<h2 className="text-lg font-semibold mb-2">Images</h2>
			<input
				type="file"
				accept="image/*"
				onChange={handleImageUpload}
				multiple
				className="mb-4"
			/>
			<div className="grid grid-cols-2 gap-4 mb-4">
				{images?.map((imageUrl, index) => (
					<div key={index} className="relative">
						<img
							src={imageUrl}
							alt={`Product Image ${index + 1}`}
							className="w-full h-auto border border-gray-300 rounded"
						/>
						<button
							type="button"
							onClick={() => handleImageDelete(index)}
							className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
							Delete
						</button>
					</div>
				))}
			</div>

			{product.type == "variable" && (
				<>
					<h2 className="text-lg font-semibold mb-2">Attributes</h2>
					{attributes.map((attribute, attrIndex) => (
						<div
							key={attribute.id}
							className="mb-4 p-4 border border-gray-300 rounded">
							<input
								type="text"
								value={attribute.name}
								onChange={(e) =>
									handleAttributeChange(attrIndex, "name", e.target.value)
								}
								placeholder="Attribute Name"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<button
								type="button"
								onClick={() => deleteAttribute(attrIndex)}
								className="bg-red-500 text-white px-4 py-2 rounded mb-2">
								Delete Attribute
							</button>
							<h3 className="font-semibold mb-2">Options</h3>
							<button
								type="button"
								onClick={() => addAttributeOption(attrIndex)}
								className="bg-blue-500 text-white px-4 py-2 rounded mb-2">
								Add Option
							</button>
							{attribute.options.map((option, optIndex) => (
								<div key={optIndex} className="mb-2">
									<input
										type="text"
										value={option}
										onChange={(e) =>
											handleOptionChange(attrIndex, optIndex, e.target.value)
										}
										placeholder="Option"
										className="p-2 border border-gray-300 rounded w-full mb-2"
									/>
									<button
										type="button"
										onClick={() => deleteAttributeOption(attrIndex, optIndex)}
										className="bg-red-500 text-white px-4 py-2 rounded">
										Delete Option
									</button>
								</div>
							))}
						</div>
					))}
					<button
						type="button"
						onClick={addAttribute}
						className="text-blue-500 mb-4">
						Add Attribute
					</button>

					<h2 className="text-lg font-semibold mb-2">Variations</h2>
					{variations.map((variation, index) => (
						<div key={index} className="mb-4">
							<input
								type="text"
								value={variation.sku}
								onChange={(e) =>
									handleVariationChange(index, "sku", e.target.value)
								}
								placeholder="SKU"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<input
								type="number"
								value={variation.price}
								onChange={(e) =>
									handleVariationChange(index, "price", e.target.value)
								}
								placeholder="Price"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<input
								type="number"
								value={variation.sale_price}
								onChange={(e) =>
									handleVariationChange(index, "sale_price", e.target.value)
								}
								placeholder="Sale Price"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<input
								type="date"
								value={
									variation.sale_price_start_date.toISOString().split("T")[0]
								}
								onChange={(e) =>
									handleVariationChange(
										index,
										"sale_price_start_date",
										new Date(e.target.value)
									)
								}
								placeholder="Sale Price Start Date"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<input
								type="date"
								value={
									variation.sale_price_end_date.toISOString().split("T")[0]
								}
								onChange={(e) =>
									handleVariationChange(
										index,
										"sale_price_end_date",
										new Date(e.target.value)
									)
								}
								placeholder="Sale Price End Date"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							<input
								type="number"
								value={variation.stock_quantity}
								onChange={(e) =>
									handleVariationChange(index, "stock_quantity", e.target.value)
								}
								placeholder="Stock Quantity"
								className="p-2 border border-gray-300 rounded w-full mb-2"
							/>
							{variation.attributes.map((attr, attrIndex) => (
								<select
									key={attr.name}
									value={attr.option}
									onChange={(e) =>
										handleVariationAttributeChange(
											index,
											attrIndex,
											e.target.value
										)
									}
									className="p-2 border border-gray-300 rounded w-full mb-2">
									<option value="">Select {attr.name}</option>
									{attributes
										.find((a) => a.name === attr.name)
										?.options.map((option, optIndex) => (
											<option key={optIndex} value={option}>
												{option}
											</option>
										))}
								</select>
							))}
							<button
								type="button"
								onClick={() => handleVariationDelete(index)}
								className="text-red-500">
								Delete Variation
							</button>
						</div>
					))}
					<button
						type="button"
						onClick={addManualVariation}
						className="text-blue-500 mb-4">
						Add Manual Variation
					</button>
					<button
						type="button"
						onClick={autoGenerateVariations}
						className="text-blue-500 mb-4">
						Auto Generate Variations
					</button>
				</>
			)}

			<button type="submit" className="p-2 bg-blue-500 text-white rounded">
				Submit
			</button>
		</form>
	);
};

export default ProductForm;

// Utility function to get all combinations of attributes
const getCombinations = (attributes) => {
	const combinations = [[]];
	for (const attribute of attributes) {
		const newCombinations = [];
		for (const option of attribute.options) {
			for (const combination of combinations) {
				newCombinations.push([
					...combination,
					{ name: attribute.name, option },
				]);
			}
		}
		combinations.splice(0, combinations.length, ...newCombinations);
	}
	return combinations;
};
