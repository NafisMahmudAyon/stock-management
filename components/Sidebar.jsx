"use client";
import React from "react";

const Sidebar = ({ userData, handleLogOut }) => {
	// const userData = JSON.parse(localStorage.getItem("inventory"));
	const userEmail = userData ? userData.email : "User";
	const userFirstName = userData ? userData.first_name : "User";
	return (
		<aside className="fixed inset-y-0 left-0 backdrop-blur-sm font-[Expose-Bold] bg-secondary-bg    max-h-screen w-60  shadow-sm ">
			<div className="flex flex-col justify-between h-full">
				<div className="flex-1">
					<div className="px-4 py-6 text-center border-b">
						<h1 className="text-xl font-bold  leading-none">
							Stock Management
						</h1>
					</div>
					<div className="p-4">
						<h2>Welcome, {userFirstName}!</h2>

						<ul className="space-y-1 mt-4">
							<li className="">
								{" "}
								<a
									href="http://"
									className="flex items-center rounded-lg px-4 py-3 font-semibold hover:bg-[rgb(105,100,101,.25)] ">
									Add New Product
								</a>
							</li>
							<li className="">
								{" "}
								<a
									href="http://"
									className="flex items-center rounded-lg px-4 py-3 font-semibold hover:bg-[rgb(105,100,101,.25)] ">
									All Products
								</a>
							</li>
						</ul>
					</div>
				</div>
				<button onClick={handleLogOut}>Sign Out</button>
			</div>
		</aside>
	);
};

export default Sidebar;
