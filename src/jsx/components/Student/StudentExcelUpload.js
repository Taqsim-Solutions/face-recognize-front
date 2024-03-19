import React, { useState } from "react";
import { Modal } from "react-bootstrap";

const FileUpload = ({ isCreate, user, onClose }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "https://face.taqsim.uz/api/students/upload-excel",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("File uploaded successfully:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  return (
    <>
      <Modal onHide={onClose} show={isCreate} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              Add Excel File
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label htmlFor="formFile" className="form-label">
                Default file input example
              </label>
              <input
                className="form-control"
                type="file"
                id="formFile"
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger light"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
            >
              {user ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FileUpload;
