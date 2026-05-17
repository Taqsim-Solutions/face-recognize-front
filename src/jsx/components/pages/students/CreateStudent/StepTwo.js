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
  const [allFiles, setAllFiles] = useState([]); // Consolidates all file objects (camera & uploaded)
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      setAllFiles([...allFiles, imageFile]);
      setStep(step + 1);

      swal({
        title: t("screenApproved") || "Muvaffaqiyatli suratga olindi",
        icon: "success",
        timer: 1200,
        buttons: false,
      });
    }, "image/jpeg");
  };

  const stopCamera = () => {
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setCamera(false);
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    setAllFiles([...allFiles, ...fileArray]);
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

    if (allFiles.length === 0) {
      alert("Kamida 1 ta rasm yuklang!");
      return;
    }

    const uploadPromises = allFiles.map(
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

  const deletePhoto = (index) => {
    const newCaptured = [...capturedImages];
    newCaptured.splice(index, 1);
    setCapturedImages(newCaptured);

    const newFiles = [...allFiles];
    newFiles.splice(index, 1);
    setAllFiles(newFiles);
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setFacingMode("environment"); // Default to back-facing on smaller screens
    }
  }, []);

  return (
    <div>
      {!showCamera && (
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
            <button
              className="btn btn-danger"
              onClick={stopCamera}
              style={{ margin: "10px" }}
            >
              {t("closeButton")}
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
              <img style={{ width: "100%", borderRadius: "8px" }} src={image} alt="" />
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
