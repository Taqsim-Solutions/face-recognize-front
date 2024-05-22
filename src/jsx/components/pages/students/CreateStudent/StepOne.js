import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import {
  createStudent,
  deleteStudentPhoto,
  editStudent,
  getStudent,
  studentParent,
} from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";
import settings from "../../../../../settings/settings";
import { useTranslation } from "react-i18next";

const StepOne = ({ setGoSteps, setCreatedStudentId }) => {
  const [father, setFather] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    dateOfBirth: "",
    phoneNumber: "",
    passport: "",
    gender: 0,
  });
  const [mother, setMother] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    dateOfBirth: "",
    phoneNumber: "",
    passport: "",
    gender: 1,
  });
  const [mainImage, setMainImage] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fatherName, setFatherNamee] = useState("");
  const [reflesh, setReflesh] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  let errorsObj = {
    firstName: "",
    lastName: "",
    phone: "",
    dateOfBirth: "",
    fatherName: "",
  };
  const { studentId } = useParams();
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  const onDeleteImage = (imageName) => {
    deleteStudentPhoto(imageName).then(() => {
      queryClient.invalidateQueries(["students"]);
      setReflesh(reflesh + 1);
    });
  };

  const changeFatherInfo = (key, value) => {
    setFather({ ...father, [key]: value });
  };

  const changeMotherInfo = (key, value) => {
    setMother({ ...mother, [key]: value });
  };

  const onSubmit = () => {
    let error = false;
    const errorObj = { ...errorsObj };
    if (firstName === "") {
      errorObj.firstName = `${t("firstName")} ${t("isRequired")}`;
      error = true;
    }
    if (lastName === "") {
      errorObj.lastName = `${t("lastName")} ${t("isRequired")}`;
      error = true;
    }
    if (phone === "") {
      errorObj.phone = `${t("phone")} ${t("isRequired")}`;
      error = true;
    }

    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (studentId ? editStudent : createStudent)(
      {
        firstName,
        lastName,
        phoneNumber: phone,
        fatherName,
        dateOfBirth: `${dateOfBirth}T12:45:33.613Z`,
        passport: "",
        gender: 0,
      },
      studentId
    )
      .then((res) => {
        queryClient.invalidateQueries(["students"]);
        if (res.result.id) {
          studentParent(res.result.id, {
            ...father,
            passport: "",
            dateOfBirth: `${father.dateOfBirth}T12:45:33.613Z`,
          });
          studentParent(res.result.id, {
            ...mother,
            passport: "",
            dateOfBirth: `${mother.dateOfBirth}T12:45:33.613Z`,
          });
        }
        if (res.result.mainImageName) {
          navigate("/students");
        } else {
          setCreatedStudentId(res.result.id);
          setGoSteps(2);
        }
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (studentId) {
      getStudent(studentId).then((res) => {
        setFirstName(res.result.firstName);
        setLastName(res.result.lastName);
        setFatherNamee(res.result.fatherName);
        setDateOfBirth(res.result.dateOfBirth.slice(0, 10));
        setPhone(res.result.phoneNumber);
        setImages(res.result.imageIds);
        setMainImage(res.result.mainImageName);
        setFather({
          ...res.result.parents?.[0],
          dateOfBirth: res.result.parents?.[0].dateOfBirth?.slice(0, 10),
        });
        setMother({
          ...res.result.parents?.[1],
          dateOfBirth: res.result.parents?.[1].dateOfBirth?.slice(0, 10),
        });
      });
    }
  }, [studentId, reflesh]);

  return (
    <section>
      <div className="row">
        <p style={{ color: "black", fontWeight: 700, fontSize: "16px" }}>
          {t("student")}
        </p>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("firstName")}*</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              name="firstName"
              className="form-control"
              required
            />
            {errors.firstName && (
              <div className="text-danger fs-12">{errors.firstName}</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("lastName")}*</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              name="lastName"
              className="form-control"
              required
            />
            {errors.lastName && (
              <div className="text-danger fs-12">{errors.lastName}</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("fatherName")}*</label>
            <input
              value={fatherName}
              onChange={(e) => setFatherNamee(e.target.value)}
              type="text"
              name="fatherName"
              className="form-control"
              required
            />
            {errors.fatherName && (
              <div className="text-danger fs-12">{errors.fatherName}</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("dateOfBirth")}*</label>
            <input
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              type="date"
              name="dateOfBirth"
              className="form-control"
            />
            {errors.dateOfBirth && (
              <div className="text-danger fs-12">{errors.dateOfBirth}</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("phone")}*</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="phone"
              name="phone"
              className="form-control"
              required
            />
            {errors.phone && (
              <div className="text-danger fs-12">{errors.phone}</div>
            )}
          </div>
        </div>
        <p style={{ color: "black", fontWeight: 700, fontSize: "16px" }}>
          {t("father_of_student")}
        </p>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("firstName")}*</label>
            <input
              value={father.firstName}
              onChange={(e) => changeFatherInfo("firstName", e.target.value)}
              type="text"
              name="firstName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("lastName")}*</label>
            <input
              value={father.lastName}
              onChange={(e) => changeFatherInfo("lastName", e.target.value)}
              type="text"
              name="lastName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("fatherName")}*</label>
            <input
              value={father.fatherName}
              onChange={(e) => changeFatherInfo("fatherName", e.target.value)}
              type="text"
              name="fatherName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("dateOfBirth")}*</label>
            <input
              value={father.dateOfBirth}
              onChange={(e) => changeFatherInfo("dateOfBirth", e.target.value)}
              type="date"
              name="dateOfBirth"
              className="form-control"
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("phone")}*</label>
            <input
              value={father.phoneNumber}
              onChange={(e) => changeFatherInfo("phoneNumber", e.target.value)}
              type="phone"
              name="phone"
              className="form-control"
              required
            />
          </div>
        </div>
        <p style={{ color: "black", fontWeight: 700, fontSize: "16px" }}>
          {t("mother_of_student")}
        </p>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("firstName")}*</label>
            <input
              value={mother.firstName}
              onChange={(e) => changeMotherInfo("firstName", e.target.value)}
              type="text"
              name="firstName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("lastName")}*</label>
            <input
              value={mother.lastName}
              onChange={(e) => changeMotherInfo("lastName", e.target.value)}
              type="text"
              name="lastName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("fatherName")}*</label>
            <input
              value={mother.fatherName}
              onChange={(e) => changeMotherInfo("fatherName", e.target.value)}
              type="text"
              name="fatherName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("dateOfBirth")}*</label>
            <input
              value={mother.dateOfBirth}
              onChange={(e) => changeMotherInfo("dateOfBirth", e.target.value)}
              type="date"
              name="dateOfBirth"
              className="form-control"
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">{t("phone")}*</label>
            <input
              value={mother.phoneNumber}
              onChange={(e) => changeMotherInfo("phoneNumber", e.target.value)}
              type="phone"
              name="phone"
              className="form-control"
              required
            />
          </div>
        </div>
        {studentId && images?.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
              gap: "18px",
              marginBottom: "20px",
            }}
          >
            {images.map((image) => (
              <div key={image} style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "15px",
                    background: "white",
                    width: "35px",
                    height: "35px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingBottom: "2.5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  <i
                    className="material-icons"
                    style={{
                      color: image === mainImage ? "orange" : "grey",
                    }}
                  >
                    workspace_premium
                  </i>
                </div>
                <img
                  src={`${settings.baseURL}/images?filename=${image}`}
                  alt=""
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <button
                  className="btn btn-danger sw-btn-next ms-1 mt-3"
                  style={{ width: "100%" }}
                  onClick={() => onDeleteImage(image)}
                >
                  {t("delete")}
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          className="btn btn-primary sw-btn-next ms-1"
          onClick={onSubmit}
          disabled={loading}
        >
          {t("nextButton")}
        </button>
      </div>
    </section>
  );
};

export default StepOne;
