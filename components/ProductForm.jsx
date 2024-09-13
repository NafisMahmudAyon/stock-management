"use client";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill"; // Import React Quill
import "react-quill/dist/quill.snow.css"; // Import Quill styles

const ProductForm = ({ onSubmit }) => {
	const [product, setProduct] = useState({
		id: 0,
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
		tags: [],
		images: [],
		attributes: [],
		variations: [],
		reviews_allowed: false,
		average_rating: "0",
		rating_count: 0,
	});

	console.log(product);

	const [attributes, setAttributes] = useState([]);
	const [variations, setVariations] = useState([]);
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

	// Handle adding a new attribute
	const addAttribute = () => {
		setAttributes([...attributes, { id: Date.now(), name: "", options: [] }]);
	};

	// Handle adding a new option to an attribute
	const addAttributeOption = (attrIndex) => {
		const newAttributes = [...attributes];
		newAttributes[attrIndex].options.push("");
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

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ ...product, attributes, variations });
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

			<input
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
			/>

			<input
				type="text"
				name="tags"
				value={product.tags.join(", ")}
				onChange={(e) =>
					setProduct({
						...product,
						tags: e.target.value.split(",").map((tag) => tag.trim()),
					})
				}
				placeholder="Tags (comma-separated)"
				className="p-2 border border-gray-300 rounded w-full mb-4"
			/>

			<h2 className="text-lg font-semibold mb-2">Attributes</h2>
			{attributes.map((attr, index) => (
				<div key={attr.id} className="mb-4">
					<input
						type="text"
						value={attr.name}
						onChange={(e) =>
							handleAttributeChange(index, "name", e.target.value)
						}
						placeholder="Attribute Name"
						className="p-2 border border-gray-300 rounded w-full mb-2"
					/>
					{attr.options.map((opt, optIndex) => (
						<input
							key={optIndex}
							type="text"
							value={opt}
							onChange={(e) =>
								handleOptionChange(index, optIndex, e.target.value)
							}
							placeholder="Option"
							className="p-2 border border-gray-300 rounded w-full mb-2"
						/>
					))}
					<button
						type="button"
						onClick={() => addAttributeOption(index)}
						className="text-blue-500">
						Add Option
					</button>
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
						value={variation.sale_price_start_date.toISOString().split("T")[0]}
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
						value={variation.sale_price_end_date.toISOString().split("T")[0]}
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
								handleVariationAttributeChange(index, attrIndex, e.target.value)
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
