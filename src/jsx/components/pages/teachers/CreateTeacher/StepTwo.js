import React, { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { uploadPhoto } from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function StepTwo({ uploadProps, id }) {
  const [step, setStep] = useState(1);
  const [facingMode, setFacingMode] = useState("user");
  const [showCamera, setCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [allFiles, setAllFiles] = useState([]); // Consolidates all file objects (camera & uploaded)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const { t } = useTranslation();

  const startCamera = async (mode) => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      const constraints = { video: { facingMode: mode } };

      // Stop any existing stream before starting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        setCamera(true);
        setTimeout(() => {
          if (videoRef.current) {
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

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      setCamera(false);
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    setAllFiles([...allFiles, ...fileArray]);
    const fileList = fileArray.map((file) => URL.createObjectURL(file));
    setCapturedImages([...capturedImages, ...fileList]);
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const imageName = uploadProps?.placeholder || "image.jpg";
      const imageFile = new File([blob], imageName, { type: blob.type });
      setAllFiles([...allFiles, imageFile]);
      setCapturedImages([...capturedImages, URL.createObjectURL(imageFile)]);
      setStep(step + 1);

      swal({
        title: t("screenApproved") || "Muvaffaqiyatli suratga olindi",
        icon: "success",
        timer: 1200,
        buttons: false,
      });
    }, "image/jpeg");
  };

  const toggleFacingMode = () => {
    setFacingMode(facingMode === "user" ? "environment" : "user");
    startCamera(facingMode === "user" ? "environment" : "user");
  };

  const onSubmit = async () => {
    stopCamera();
    if (allFiles.length === 0) {
      alert("Kamida 1 ta rasm yuklang!");
      return;
    }

    const uploadPromises = allFiles.map(
      async (imageFile, index) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        return uploadPhoto(formData, id || teacherId);
      }
    );

    try {
      await Promise.all(uploadPromises);
      navigate("/teachers");
    } catch (error) {
      alert("An error occurred during the upload process.");
    }
  };

  const deletePhoto = (index) => {
    const newCaptured = [...capturedImages];
    newCaptured.splice(index, 1);
    setCapturedImages(newCaptured);

    const newFiles = [...allFiles];
    newFiles.splice(index, 1);
    setAllFiles(newFiles);
  };

  useEffect(() => {
    if (showCamera) {
      startCamera(facingMode);
    }
  }, [showCamera, facingMode]);

  return (
    <div>
      {!showCamera && (
        <div>
          <div
            onClick={() => startCamera(facingMode)}
            className="py-10"
            style={{
              fontSize: "30px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              justifyContent: "center",
              cursor: "pointer",
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
              {t("uploadImage")}
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
      {showCamera && (
        <>
          <video ref={videoRef} autoPlay muted className="video" />
          <div style={{ textAlign: "center" }}>
            <button
              className="btn btn-primary"
              style={{ marginTop: "20px" }}
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
              style={{ margin: "10px auto" }}
              onClick={toggleFacingMode}
            >
              {facingMode === "user"
                ? t("switchToRearCamera")
                : t("switchToFrontCamera")}
            </button>
            <button
              className="btn btn-danger"
              onClick={stopCamera}
              style={{ margin: "10px" }}
            >
              {t("closeButton")}
            </button>
          </div>
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </>
      )}
      {capturedImages.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {capturedImages.map((image, i) => (
            <div key={i} style={{ position: "relative" }}>
              <img
                src={image}
                alt={`Captured ${i}`}
                style={{ width: "100%", borderRadius: "8px" }}
              />
              <button
                className="btn btn-danger btn-xs"
                style={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  padding: "2px 5px",
                  fontSize: "10px",
                }}
                onClick={() => deletePhoto(i)}
              >
                {t("delete")}
              </button>
            </div>
          ))}
        </div>
      )}
      {capturedImages.length >= 1 && (
        <button
          className="btn btn-primary"
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
