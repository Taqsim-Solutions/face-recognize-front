import { useRef, useState } from "react";
import swal from "sweetalert";
import { uploadPhoto } from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";

function StepTwo({ uploadProps, id }) {
  const [step, setStep] = useState(1);
  const [showCamera, setCamera] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [capturedImages, setCapturedImages] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();
  const { teacherId } = useParams();

  const startCamera = async (facingMode) => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      const constraints = {
        video: {
          facingMode,
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
    }
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
        "Okay, next one",
        `Now ${
          step === 1
            ? "Look right and click "
            : step === 2
            ? "Look left and click "
            : step === 3
            ? "Look right again and click "
            : step === 4
            ? "Look back and click "
            : "Look forward and click "
        }`,
        "success"
      );
    }
  };

  const onSubmit = async () => {
    const uploadPromises = imageFiles.map(async (imageFile, index) => {
      const formData = new FormData();
      formData.append("file", imageFile);
      return uploadPhoto(formData, id || teacherId)
        .then((response) => {
          return response.data;
        })
        .catch((error) => {
          throw error;
        });
    });
    const uploadResults = await Promise.all(uploadPromises);
    navigate("/teachers");
  };

  return (
    <div>
      {!showCamera && (
        <div
          onClick={() => startCamera(true)}
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
          Open the camera
        </div>
      )}
      <div position="relative" mt="20px">
        {showCamera && step !== 2 && (
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
                  ? "Look right and click "
                  : step === 2
                  ? "Look left and click "
                  : step === 3
                  ? "Look right again and click "
                  : step === 4
                  ? "Look back and click "
                  : "Look forward and click "}
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
      {step === 2 && (
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
      {step === 2 && (
        <button
          className="btn btn-primary sw-btn-next ms-1"
          style={{ margin: "40px auto", width: "100%" }}
          onClick={onSubmit}
        >
          Send
        </button>
      )}
    </div>
  );
}

export default StepTwo;
