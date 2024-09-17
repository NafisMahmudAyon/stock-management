'use client'
import React, { useEffect, useState } from 'react'
import DummyImage from '@/image/dummy-product-image.jpg'
import Image from 'next/image'

const DashboardAllProducts = ({product}) => {
  const [categories, setCategories] = useState([]);
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
  return (
		<div className='group flex text-sm gap-4 '>
			<div className="w-[60px] h-[60px] flex items-center justify-center ">
				{product.images ? (
					<Image className='object-contain w-[60px] h-[60px] '
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
      <div className='flex-1'>
        <p>{product.name}</p>
        <div className='group-hover:visible invisible'>ddd</div>
      </div>
      <div>{product.sku ? product.sku : "-"}</div>
      <div>{product.type}</div>
      <div>{product.stock_status}</div>
      <div>
        {product.sale_price == 0 ? product.price : <span><span className='line-through '>{product.price}</span> - {product.sale_price} </span>}
        {/* {product.price} */}
      </div>
      <div>
        {product.categories.length > 0 && 
        product.categories.map((category, index)=> {
          const cat = categories.find((cat) => cat.value == category);
          return (
            <span key={index}>{cat?.label}, </span>
          )
        }) }
      </div>
      <div>{product.status}</div>
		</div>
	);
}

export default DashboardAllProducts