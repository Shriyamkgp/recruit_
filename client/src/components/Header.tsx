import React from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  return (
    <NavigationMenu className="w-full justify-center shadow-md bg-white p-2">
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link
              to="/"
              className="font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              Home
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink className="p-3 block">
              Home Page Summary
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link
              to="/about"
              className="font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              About
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink className="p-3 block">
              Get To Know Us
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <Link
              to="/login"
              className="font-medium text-gray-700 hover:text-indigo-600 transition"
            >
              Sign In
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavigationMenuLink className="p-3 block">
              Already a User?
            </NavigationMenuLink>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

export default Header;
