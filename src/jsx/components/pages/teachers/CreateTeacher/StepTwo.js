import { useEffect, useRef, useState } from "react";
import swal from "sweetalert";
import { uploadPhoto } from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function StepTwo({ uploadProps, id }) {
  const [step, setStep] = useState(1);
  const [facingMode, setFacingMode] = useState("user");
  const [showCamera, setCamera] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const { t } = useTranslation();
  const [images, setImages] = useState([]);

  const startCamera = async (facingMode) => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      const constraints = {
        video: {
          facingMode: {
            exact: facingMode,
          },
        },
      };

      try {
        // Stop the current stream if it exists
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
        }

        setCamera(true);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = null;
        videoRef.current.srcObject = stream;

        // Save the new stream reference
        streamRef.current = stream;
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    } else {
      console.error("MediaDevices not supported");
    }
  };

  const stopCamera = () => {
    // Stop the camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      setCamera(false);
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    setImages([...images, ...fileArray]);
    const fileList = fileArray.map((file) => URL.createObjectURL(file));
    setCapturedImages([...capturedImages, ...fileList]);
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Set canvas size to match video's resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = canvas.toBlob((imageBlob) => {
      const imageName = uploadProps?.placeholder || "image.jpg";
      const imageFile = new File([imageBlob], imageName, {
        type: imageBlob.type,
      });
      setCapturedImages([...capturedImages, URL.createObjectURL(imageFile)]); // Store captured image in state
      setImageFiles([...imageFiles, imageFile]);
      // onChange(imageFile);
    }, "image/jpeg");
    if (step < 6) {
      setStep(step + 1);
      swal(
        t("Okay, next one"),
        step === 1
          ? t("lookLeft")
          : step === 2
          ? t("lookRightAgain")
          : step === 3
          ? t("lookBack")
          : step === 4
          ? t("lookForward")
          : t("lookForward"),
        "success"
      );
    }
  };

  const onSubmit = async () => {
    stopCamera();
    if (imageFiles.length !== 5 && images.length !== 5) {
      alert("5 images must be uploaded");
    }
    const uploadPromises = (imageFiles.length === 5 ? imageFiles : images).map(
      async (imageFile, index) => {
        const formData = new FormData();
        formData.append("file", imageFile);
        return uploadPhoto(formData, id || teacherId)
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            alert(error.data.message);
          });
      }
    );
    const uploadResults = await Promise.all(uploadPromises);
    navigate("/teachers");
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setFacingMode("environment");
    }
  }, []);

  return (
    <div>
      {!showCamera && capturedImages.length < 6 && (
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
              multiple // Add multiple attribute here
            />
          </div>
        </div>
      )}
      <div position="relative" mt="20px">
        {showCamera && step !== 6 && (
          <>
            <video
              id="video"
              ref={videoRef}
              autoPlay
              muted
              style={{
                borderRadius: "10px",
                width: "35%",
                display: "block",
                margin: "0 auto",
              }}
            />
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
            </div>
            <canvas
              id="canvas"
              ref={canvasRef}
              style={{
                display: "none",
                width: window.innerWidth,
                height: window.innerHeight,
              }}
            />
          </>
        )}
      </div>
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
