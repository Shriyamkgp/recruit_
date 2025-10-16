import React from "react";
import Header from "@/components/Header";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


import "../styles/Home.css";


const Home = () => {
  // Logic for a simple static page is minimal

  return (
    <>
      <Header />

      {/* Main content container with Accordion for information */}

      <div className="m-10 flex w-[600px] flex-col items-center justify-center gap-6">
        <Accordion
          type="single"
          collapsible
          className="w-full"
          defaultValue="item-1" // Set 'Product Information' as open by default
        >
          {/* Accordion Item 1: Product Information */}

          <AccordionItem value="item-1">
            <AccordionTrigger>Product Information</AccordionTrigger>

            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                Our flagship product combines cutting-edge technology with sleek
                design. Built with premium materials, it offers unparalleled
                performance and reliability.
              </p>

              <p>
                Key features include advanced processing capabilities, and an
                intuitive user interface designed for both beginners and
                experts.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion Item 2: Shipping Details */}

          <AccordionItem value="item-2">
            <AccordionTrigger>Shipping Details</AccordionTrigger>

            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We offer worldwide shipping through trusted courier partners.
                Standard delivery takes 3-5 business days, while express
                shipping ensures delivery within 1-2 business days.
              </p>

              <p>
                All orders are carefully packaged and fully insured. Track your
                shipment in real-time through our dedicated tracking portal.
              </p>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion Item 3: Return Policy */}

          <AccordionItem value="item-3">
            <AccordionTrigger>Return Policy</AccordionTrigger>

            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We stand behind our products with a comprehensive 30-day return
                policy. If you&apos;re not completely satisfied, simply return
                the item in its original condition.
              </p>

              <p>
                Our hassle-free return process includes free return shipping and
                full refunds processed within 48 hours of receiving the returned
                item.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Navigation Buttons for different user roles */}

      <div className="flex gap-4 margin-30">
        {/* Link for Applicant flow */}

        <Button asChild>
          <Link to="./applicant">Find Job</Link>
        </Button>

        {/* Link for HR flow (corrected to use <Link> directly inside <Button asChild> or a simple <Link> with <Button>) */}

        <Link to="../hrf">
          <Button variant="secondary">Find Talent</Button>
        </Link>
      </div>
    </>
  );
};

export default Home;
