import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import * as RecruitApi from "@/api/RecruitApi";

import "../styles/Thankyou.css";

const submitFeedback = async (
  applicationId: string,

  rating: number,

  comment: string
) => {
  console.log(
    `Submitting feedback for App ID ${applicationId}: Rating=${rating}, Comment="${comment}"`
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true };
};

const Thankyou = () => {
  const applicationId = sessionStorage.getItem("applicationId");

  // --- Feedback State ---

  const [rating, setRating] = useState(0);

  const [comment, setComment] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear interview-specific flags on mount

  useEffect(() => {
    localStorage.removeItem("startInterview");
  }, []);

  // --- Handlers ---

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!applicationId || isSubmitting || isSubmitted || rating === 0) return;

    setIsSubmitting(true);

    try {
      // API call to submit the feedback

      await submitFeedback(applicationId, rating, comment);

      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);

      alert("Failed to submit feedback. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Render ---

  const starRating = (
    <div className="flex justify-center space-x-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          onClick={() => setRating(star)}
          className={`w-8 h-8 cursor-pointer transition-colors duration-150 ${
            star <= rating
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-300"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.638-.921 1.94 0l1.24 3.824a1 1 0 00.95.691h4.026c.969 0 1.371 1.24.588 1.81l-3.264 2.375a1 1 0 00-.364 1.118l1.24 3.824c.3.921-.755 1.688-1.54 1.118l-3.264-2.375a1 1 0 00-1.176 0l-3.264 2.375c-.785.57-1.84-.197-1.54-1.118l1.24-3.824a1 1 0 00-.364-1.118L2.094 9.252c-.783-.57-.381-1.81.588-1.81h4.026a1 1 0 00.95-.691l1.24-3.824z" />
        </svg>
      ))}
    </div>
  );

  return (
    <>
      <Header />

      <div className="flex flex-col items-center justify-center min-h-svh p-4 bg-gray-50">
        <div className="max-w-xl w-full p-10 bg-white rounded-xl shadow-2xl text-center">
          <div className="text-6xl mb-6 text-green-500">🎉</div>

          <h1 className="text-3xl font-extrabold text-gray-800 mb-4">
            Interview Complete!
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Your responses have been successfully submitted. We appreciate your
            time.
          </p>

          {/* --- Feedback Form Section --- */}

          <div className="bg-indigo-50 p-6 rounded-lg mb-8 border border-indigo-200">
            <h2 className="text-xl font-semibold text-indigo-800 mb-4">
              Rate Your Experience
            </h2>

            {isSubmitted ? (
              <p className="text-green-600 font-bold">
                Thank you for your valuable feedback! 💚
              </p>
            ) : (
              <form onSubmit={handleFeedbackSubmit}>
                {starRating}

                <Textarea
                  placeholder="Share any comments or suggestions about the AI interview process (optional)."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4 resize-none"
                  rows={3}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={rating === 0 || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </form>
            )}
          </div>

          {/* --- End Feedback Form Section --- */}

          <div className="space-y-3 pt-4 border-t">
            <Link to="/applicant/dashboard">
              <Button
                size="lg"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Go to My Applications
              </Button>
            </Link>

            <Link to="/job/applicant">
              <Button variant="outline" className="w-full">
                Continue Job Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thankyou;
