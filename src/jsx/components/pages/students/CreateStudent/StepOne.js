import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import {
  createStudent,
  deleteStudentPhoto,
  editStudent,
  getStudent,
} from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";
import settings from "../../../../../settings/settings";

const StepOne = ({ setGoSteps, setCreatedStudentId }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [fatherName, setFatherNamee] = useState("");
  const [reflesh, setReflesh] = useState(0);
  const navigate = useNavigate();
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
      queryClient.invalidateQueries(["teachers"]);
      setReflesh(reflesh + 1);
    });
  };

  const onSubmit = () => {
    let error = false;
    const errorObj = { ...errorsObj };
    if (firstName === "") {
      errorObj.firstName = "First Name is Required";
      error = true;
    }
    if (lastName === "") {
      errorObj.fatherName = "Father name is Required";
      error = true;
    }
    if (phone === "") {
      errorObj.phone = "Phone is Required";
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
      });
    }
  }, [studentId, reflesh]);

  return (
    <section>
      <div className="row">
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">First Name*</label>
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
            <label className="text-label">Last Name*</label>
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
            <label className="text-label">Father Name*</label>
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
            <label className="text-label">Date of birth*</label>
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
            <label className="text-label">Phone*</label>
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
        </div>{" "}
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
              <div key={image}>
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
                  Delete
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
          Next
        </button>
      </div>
    </section>
  );
};

export default StepOne;
