import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";

export class index extends Component {
  render() {
    return (
      <>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Link to="/">Home</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Home Page Summary</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Link to="/about">About</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Get To Know Us</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Link to="/login">Sign In</Link>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <NavigationMenuLink>Already a User?</NavigationMenuLink>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </>
    );
  }
}

export default index;
