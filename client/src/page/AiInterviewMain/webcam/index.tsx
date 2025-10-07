import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

const WebcamCapture = () => {
  // Reference to the webcam component
  const webcamRef = useRef(null);

  // State to store the captured image
  const [capturedImage, setCapturedImage] = useState(null);

  // Webcam settings
  const videoConstraints = {
    width: 1280,
    height: 1500,
    facingMode: "user", // Use "environment" for rear camera
  };

  return (
    <div>
      {/* Webcam live feed */}
      <Webcam
        audio={false} // Disable audio
        ref={webcamRef}
        screenshotFormat="image/jpeg" // Format of the captured image
        videoConstraints={videoConstraints}
      />
    </div>
  );
};

export default WebcamCapture;
