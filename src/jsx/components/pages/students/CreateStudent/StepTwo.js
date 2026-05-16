import React, { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { uploadStudentPhoto } from "../../../../../api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function StepTwo({ uploadProps, studentId, createdStudentId }) {
  const [step, setStep] = useState(1);
  const [showCamera, setCamera] = useState(false);
  const [facingMode, setFacingMode] = useState("user"); // Default to front-facing camera
  const [capturedImages, setCapturedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [images, setImages] = useState([]);

  const startCamera = async (mode) => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      const constraints = {
        video: {
          facingMode: {
            exact: mode,
          },
        },
      };

      try {
        // Stop the current stream if it exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.srcObject = stream;
          }
        }, 50);
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    } else {
      console.error("MediaDevices not supported");
    }
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((imageBlob) => {
      const imageName = uploadProps?.placeholder || "image.jpg";
      const imageFile = new File([imageBlob], imageName, {
        type: imageBlob.type,
      });
      setCapturedImages([...capturedImages, URL.createObjectURL(imageFile)]);
      setImageFiles([...imageFiles, imageFile]);

      if (step < 6) {
        setStep(step + 1);
        swal(
          t("Okay, next one"),
          step === 1
            ? t("lookRight")
            : step === 2
            ? t("lookLeft")
            : step === 3
            ? t("lookRightAgain")
            : step === 4
            ? t("lookBack")
            : t("lookForward"),
          "success"
        );
      }
    }, "image/jpeg");
  };

  const stopCamera = () => {
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    setImages([...images, ...fileArray]);
    const fileList = fileArray.map((file) => URL.createObjectURL(file));
    setCapturedImages([...capturedImages, ...fileList]);
  };

  const toggleCamera = () => {
    // Switch between front and back cameras
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacingMode); // Update state to new mode
    startCamera(newFacingMode); // Restart the camera with the new mode
  };

  const onSubmit = async () => {
    stopCamera();

    if (imageFiles.length !== 5 && images.length !== 5) {
      alert("5 images must be uploaded");
      return;
    }

    const uploadPromises = (imageFiles.length === 5 ? imageFiles : images).map(
      async (imageFile, index) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        return uploadStudentPhoto(formData, studentId || createdStudentId)
          .then((response) => response.data)
          .catch((error) => {
            alert(error.message);
          });
      }
    );

    await Promise.all(uploadPromises);
    navigate("/students");
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setFacingMode("environment"); // Default to back-facing on smaller screens
    }
  }, []);

  return (
    <div>
      {!showCamera && capturedImages.length !== 5 && (
        <div>
          <div
            onClick={() => {
              setCamera(true);
              startCamera(facingMode);
            }}
            className="py-10"
            style={{
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              justifyContent: "center",
            }}
          >
            <i className="material-icons" style={{ fontSize: "100px" }}>
              camera
            </i>
            {t("openCamera")}
          </div>
          <p style={{ textAlign: "center", fontSize: "20px" }}>{t("or")}</p>
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              {t("uploadImage")} (5)
            </label>
            <input
              accept="image/*"
              className="form-control"
              type="file"
              id="formFile"
              onChange={(e) => handleImageUpload(e.target.files)}
              multiple
            />
          </div>
        </div>
      )}
      {showCamera && step !== 6 && (
        <>
          <video ref={videoRef} autoPlay muted className="video" />
          <div style={{ textAlign: "center" }}>
            <button
              className="btn btn-primary sw-btn-next ms-1"
              style={{ margin: "20px auto" }}
              onClick={takePhoto}
            >
              {step === 1
                ? t("lookRight")
                : step === 2
                ? t("lookLeft")
                : step === 3
                ? t("lookRightAgain")
                : step === 4
                ? t("lookBack")
                : t("lookForward")}
            </button>
            <button
              className="btn btn-secondary"
              onClick={toggleCamera}
              style={{ margin: "10px" }}
            >
              {facingMode === "user" ? t("useBackCamera") : t("useFrontCamera")}
            </button>
          </div>
          <canvas
            ref={canvasRef}
            style={{
              display: "none",
              width: window.innerWidth,
              height: window.innerHeight,
            }}
          />
        </>
      )}
      {capturedImages.length === 5 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          {capturedImages.map((image, i) => (
            <img style={{ width: "100%" }} key={i} src={image} alt="" />
          ))}
        </div>
      )}
      {capturedImages.length === 5 && (
        <button
          className="btn btn-primary sw-btn-next ms-1"
          style={{ margin: "40px auto", width: "100%" }}
          onClick={onSubmit}
        >
          {t("sendButton")}
        </button>
      )}
    </div>
  );
}

export default StepTwo;
