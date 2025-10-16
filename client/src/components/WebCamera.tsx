import React, { useRef, useState } from "react";
import Webcam from "react-webcam";

export function WebCameraCapture() {
  const webcamRef = useRef<Webcam | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      console.log("Image captured:", imageSrc ? "Yes" : "No");
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl shadow-2xl bg-gray-900 border-2 border-indigo-600">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
    </div>
  );
}
