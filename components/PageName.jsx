"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PageName = ({ userData, handleSignOut }) => {
	// State to hold the dashboard title
	const [dashboardTitle, setDashboardTitle] = useState("Dashboard");

	// Get the current pathname
	const pathname = usePathname();

	// Update the dashboard title based on the current URL
	useEffect(() => {
		// Extract the last part of the pathname to update the dashboard title
		const path = pathname.split("/").pop();

		// Example: Changing title based on specific paths
		if (path === "settings") {
			setDashboardTitle("Settings");
		} else if (path === "all-products") {
			setDashboardTitle("All Products");
		} else {
			setDashboardTitle("Dashboard");
		}
	}, [pathname]); // Dependency on pathname to re-run whenever the URL changes

	return <h2>{dashboardTitle}</h2>;
};

export default PageName;
