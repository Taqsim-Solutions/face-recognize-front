import React, { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const FileUpload = ({ isOpen, user, onClose }) => {
  const [file, setFile] = useState(null);
  const { t } = useTranslation();

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
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      alert("Файл загружен, студенты добавлены.");
      console.log("File uploaded successfully:", data);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    }
  };

  return (
    <>
      <Modal onHide={onClose} show={isOpen} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {t("addExcelfile")}
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
                {t("defaultFileExample")}
              </label>
              <input
                className="form-control"
                type="file"
                id="formFile"
                onChange={handleFileChange}
              />
            </div>
            <a
              href="https://face.taqsim.uz/api/students/excel-example"
              target="_blank"
              style={{
                textDecoration: "underline",
                color: "var(--primary)",
                cursor: "pointer",
              }}
            >
              {t("clickForDownloadExample")}
            </a>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-danger light"
              onClick={onClose}
            >
              {t("closeButton")}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUpload}
            >
              {user ? t("saveButton") : t("createButton")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FileUpload;
