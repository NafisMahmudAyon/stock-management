import { useState, useEffect } from "react";
import { MoonIcon, SunIcon } from "./Icons";

const ThemeSwitcher = () => {
	// State to track the current theme
	const [theme, setTheme] = useState("light");

	// Function to toggle the theme
	const changeTheme = () => {
		// Get the current theme from the HTML element's data-theme attribute
		const currentTheme = document
			.querySelector("html")
			?.getAttribute("data-theme");

		// Toggle between 'light' and 'dark' based on the current theme
		const newTheme = currentTheme === "dark" ? "light" : "dark";

		// Set the new theme
		document.querySelector("html")?.setAttribute("data-theme", newTheme);

		// Update the state to reflect the new theme
		setTheme(newTheme);
	};

	// Get the current theme when the component mounts
	useEffect(() => {
		const currentTheme = document
			.querySelector("html")
			?.getAttribute("data-theme");

		if (currentTheme) {
			setTheme(currentTheme);
		}
	}, []);

	return (
		<button
			className=""
			onClick={changeTheme}>
			{theme === "dark" ? <SunIcon /> : <MoonIcon />}
		</button>
	);
};

export default ThemeSwitcher;
