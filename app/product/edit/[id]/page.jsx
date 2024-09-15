"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { supabase } from "@/components/createClient";
import dynamic from "next/dynamic";
import Select from "react-select";

// Uncomment and dynamically load ReactQuill for rich text input (SSR safe)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditProductForm = ({ params }) => {
	const [userData, setUserData] = useState(null);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [loading, setLoading] = useState(true);
	const [apiKey, setApiKey] = useState("");
	const [isSlugEdited, setIsSlugEdited] = useState(false);
	const [categories, setCategories] = useState([]);
	const [product, setProduct] = useState({
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
		stock_status: "in_stock",
		stock_quantity: 0,
		categories: [],
		images: [],
		variations: [],
	});
	console.log(product);
	const router = useRouter();
	const { id } = params; // Corrected the param destructuring

	// Fetch user data and set signed-in status
	useEffect(() => {
		const storedUserData = localStorage.getItem("inventory");
		if (storedUserData) {
			const parsedUserData = JSON.parse(storedUserData);
			setUserData(parsedUserData);
			setIsSignedIn(true);
		}
		setLoading(false);
	}, []);
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

	// Fetch the product data by ID once user data is available
	useEffect(() => {
		const fetchProduct = async () => {
			if (!id || !userData?.email || loading) return;

			try {
				// Fetch the user's API key from Supabase
				const { data: userDatas, error: userError } = await supabase
					.from("users")
					.select("api")
					.eq("email", userData?.email)
					.single();

				if (userError || !userDatas) {
					throw new Error("Error retrieving API key");
				}

				const apiKey = userDatas.api;
				setApiKey(apiKey);

				// Fetch the product data using the API key
				const response = await axios.get(`/api/products/${id}`, {
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				});

				if (response.status === 200) {
					setProduct(response.data);
				} else {
					console.error("Failed to fetch product data");
				}
			} catch (error) {
				console.error("Error fetching product:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchProduct();
	}, [id, userData, loading]);

	useEffect(() => {
		if (!isSlugEdited) {
			const slugifiedName = product.name
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)/g, ""); // Remove leading/trailing dashes
			setProduct((prev) => ({ ...prev, slug: slugifiedName }));
		}
	}, [product.name, isSlugEdited]);

	// Handle input changes
	const handleInputChange = (e) => {
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
		setProduct([...product.attributes, { name: "", options: [] }]);
	};

	// Handle deleting an attribute
	const deleteAttribute = (index) => {
		const newAttributes = product.attributes.filter((_, i) => i !== index);
		setProduct(newAttributes);
	};

	// Handle adding a new option to an attribute
	const addAttributeOption = (attrIndex) => {
		const newAttributes = [...product.attributes];
		newAttributes[attrIndex].options.push("");
		setProduct(newAttributes);
	};

	// Handle deleting an option from an attribute
	const deleteAttributeOption = (attrIndex, optIndex) => {
		const newAttributes = [...product.attributes];
		newAttributes[attrIndex].options.splice(optIndex, 1);
		setProduct(newAttributes);
	};

	// Handle attribute change
	const handleAttributeChange = (attrIndex, field, value) => {
		const newAttributes = [...product.attributes];
		if (field === "name") {
			newAttributes[attrIndex].name = value;
		}
		setProduct(newAttributes);
	};

	// Handle option change for an attribute
	const handleOptionChange = (attrIndex, optIndex, value) => {
		const newAttributes = [...product.attributes];
		newAttributes[attrIndex].options[optIndex] = value;
		setProduct(newAttributes);
	};

	// Handle adding a manual variation
	const addManualVariation = () => {
		setProduct([
			...product.variations,
			{
				sku: "",
				price: "",
				sale_price: "", // Add sale_price
				sale_price_start_date: new Date(), // Add sale start date
				sale_price_end_date: new Date(), // Add sale end date
				stock_quantity: 0,
				attributes: product.attributes.map((attr) => ({
					name: attr.name,
					option: "",
				})),
			},
		]);
	};

	// Handle manual variation attribute selection
	const handleVariationAttributeChange = (variationIndex, attrIndex, value) => {
		const newVariations = [...product.variations];
		newVariations[variationIndex].attributes[attrIndex].option = value;
		setProduct(newVariations);
	};

	// Handle variation change
	// const handleVariationChange = (index, field, value) => {
	// 	const newVariations = [...variations];
	// 	newVariations[index][field] = value;
	// 	setVariations(newVariations);
	// };

	const handleVariationDelete = (index) => {
		const newVariations = [...product.variations];
		newVariations.splice(index, 1);
		setProduct(newVariations);
	};

	// Handle auto-generation of variations
	const autoGenerateVariations = () => {
		const attributeCombinations = getCombinations(product.attributes);
		const newVariations = attributeCombinations.map((combination) => ({
			sku: "",
			price: "",
			sale_price: "", // Add sale_price
			sale_price_start_date: new Date(), // Add sale start date
			sale_price_end_date: new Date(), // Add sale end date
			stock_quantity: 0,
			attributes: combination,
		}));
		setProduct(newVariations);
	};

	// Handle image upload via Cloudinary
	const handleImageUpload = async (e) => {
		const files = e.target.files;
		const uploadedImages = [];
		const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
		const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME;

		for (let file of files) {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("upload_preset", uploadPreset);

			const { data } = await axios.post(cloudinaryUploadUrl, formData);
			uploadedImages.push(data.secure_url);
		}

		setProduct((prev) => ({
			...prev,
			images: [...prev.images, ...uploadedImages],
		}));
	};

	const handleImageDelete = (index) => {
		const newImages = images.filter((_, i) => i !== index); // Use images state instead of product.images
		// setImages(newImages);
		setProduct((prev) => ({
			...prev,
			images: [...prev.images, ...newImages],
		}));
	};

	// Initialize an empty result object
	var groupedAttributes = {};
	var attributes = []
if(product.type === 'variable') {
	// Iterate over the variations
	product.variations.forEach((variation) => {
		variation.attributes.forEach((attribute) => {
			const { name, option } = attribute;

			// If the attribute name is not yet in the result, initialize it
			if (!groupedAttributes[name]) {
				groupedAttributes[name] = new Set();
			}

			// Add the option to the attribute set (sets only allow unique values)
			groupedAttributes[name].add(option);
		});
	});

	// Convert the groupedAttributes object to the desired array format
	attributes = Object.keys(groupedAttributes).map((name) => ({
		name,
		options: Array.from(groupedAttributes[name]),
	}));
}
console.log(attributes)
	// Handle variation changes
	const handleVariationChange = (index, field, value) => {
		const updatedVariations = [...product.variations];
		updatedVariations[index] = {
			...updatedVariations[index],
			[field]: value,
		};
		setProduct({ ...product, variations: updatedVariations });
	};

	// Add a new variation
	const handleAddVariation = () => {
		setProduct((prev) => ({
			...prev,
			variations: [
				...prev.variations,
				{
					sku: "",
					price: 0,
					sale_price: 0,
					stock_quantity: 0,
					attributes: [],
				},
			],
		}));
	};

	// Handle form submission to update the product
	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log(product);
		try {
			const response = await axios.put(`/api/products/${id}`, product, {
				headers: {
					Authorization: `Bearer ${apiKey}`,
				},
			});
			console.log(response);
			if (response.status === 200) {
				alert("Product updated successfully");
				router.push("/products");
			}
		} catch (error) {
			console.error("Failed to update product", error);
			alert("Error updating product.");
		}
	};

	// Render loading state or the form
	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<form onSubmit={handleSubmit}>
			
			<div>
				<label>Name:</label>
				<input
					type="text"
					name="name"
					value={product.name}
					onChange={handleInputChange}
				/>
			</div>
			<div>
				<label>Slug:</label>
				<input
					type="text"
					name="slug"
					value={product.slug}
					onChange={handleInputChange}
				/>
			</div>
			<select
				name="type"
				value={product.type}
				onChange={handleInputChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="single">Single</option>
				<option value="variable">Variable</option>
			</select>
			<select
				name="status"
				value={product.status}
				onChange={handleInputChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="draft">Draft</option>
				<option value="published">Published</option>
				<option value="unpublished">Unpublished</option>
			</select>
			<div>
				<label>Description:</label>
				{/* Uncomment ReactQuill for rich text editing */}
				<ReactQuill
					value={product.description}
					onChange={(value) =>
						setProduct((prev) => ({ ...prev, description: value }))
					}
				/>
			</div>
			<div>
				<label>Short Description:</label>
				{/* Uncomment ReactQuill for rich text editing */}
				<ReactQuill
					value={product.short_description}
					onChange={(value) =>
						setProduct((prev) => ({ ...prev, short_description: value }))
					}
				/>
			</div>
			<div>
				<label>Price:</label>
				<input
					type="number"
					name="price"
					value={product.price}
					onChange={handleInputChange}
				/>
			</div>
			<input
				type="text"
				name="sku"
				value={product.sku}
				onChange={handleInputChange}
				placeholder="SKU"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<input
				type="number"
				name="regular_price"
				value={product.regular_price}
				onChange={handleInputChange}
				placeholder="Regular Price"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<input
				type="number"
				name="sale_price"
				value={product.sale_price}
				onChange={handleInputChange}
				placeholder="Sale Price"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<select
				name="stock_status"
				value={product.stock_status}
				onChange={handleInputChange}
				className="p-2 border border-gray-300 rounded w-full mb-4">
				<option value="instock">In Stock</option>
				<option value="outofstock">Out of Stock</option>
			</select>

			<input
				type="number"
				name="stock_quantity"
				value={product.stock_quantity}
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
						product.categories.includes(category.value.toString())
					)}
					onChange={handleCategoryChange}
					className="mb-4"
				/>
			</div>
			<div>
				<label>Images:</label>
				<input type="file" multiple onChange={handleImageUpload} />
				<div>
					{product.images.map((image, index) => (
						<div key={index} className="relative">
							<img src={image} alt={`Image ${index}`} width="100" />
							<button
								type="button"
								onClick={() => handleImageDelete(index)}
								className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded">
								Delete
							</button>
						</div>
					))}
				</div>
			</div>
			{product.type == "variable" && (
				<div>
					<h2 className="text-lg font-semibold mb-2">Attributes</h2>
					{attributes.map((attribute, attrIndex) => (
						<div
							key={attrIndex}
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

					<label>Variations:</label>
					{product.variations.map((variation, index) => (
						<div key={index}>
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
								value={variation.sale_price_start_date}
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
								value={variation.sale_price_end_date}
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
					<button type="button" onClick={handleAddVariation}>
						Add Variation
					</button>
				</div>
			)}
			<button type="submit">Update Product</button>
		</form>
	);
};

export default EditProductForm;
