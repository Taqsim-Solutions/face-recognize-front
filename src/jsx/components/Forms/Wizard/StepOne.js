import { useQueryClient } from "@tanstack/react-query";
import React, { useState } from "react";
import swal from "sweetalert";
import { createCustomer } from "../../../../api";

const StepOne = () => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fatherName, setfathername] = useState("");
  const [phone, setPhone] = useState("");
  const [passport, setPassport] = useState("");
  const [gender, setGender] = useState(0);
  let errorsObj = {
    firstName: "",
    lastName: "",
    fatherName: "",
    phone: "",
    passport: "",
    gender: "",
  };
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  console.log(errors);

  const onSubmit = () => {
    setLoading(true);
    let error = false;
    const errorObj = { ...errorsObj };
    if (firstName === "") {
      errorObj.firstName = "First Name is Required";
      error = true;
    }
    if (lastName === "") {
      errorObj.lastName = "Last Name is Required";
      error = true;
    }
    if (fatherName === "") {
      errorObj.fatherName = "Father Name is Required";
      error = true;
    }
    if (phone === "") {
      errorObj.phone = "Phone is Required";
      error = true;
    }
    if (passport === "") {
      errorObj.password = "Passport is Required";
      error = true;
    }
    if (gender === "") {
      errorObj.gender = "Gender id is Required";
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    createCustomer({
      firstName,
      lastName,
      fatherName,
      gender,
      passport,
      phoneNumber: phone,
    })
      .then(() => {
        queryClient.invalidateQueries(["customers"]);
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

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
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">Father name*</label>
            <input
              value={fatherName}
              onChange={(e) => setfathername(e.target.value)}
              type="text"
              name="fatherName"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div className="form-group mb-3">
            <label className="text-label">Phone Number*</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="text"
              name="phoneNumber"
              className="form-control"
              placeholder="998"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="form-group mb-3">
            <label className="text-label">Passport*</label>
            <input
              value={passport}
              onChange={(e) => setPassport(e.target.value)}
              type="text"
              name="passport"
              className="form-control"
              required
            />
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="d-block my-3">
            <div className="form-check custom-radio mb-2">
              <input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                id="0"
                name="gender"
                type="radio"
                className="form-check-input"
                required
                checked
              />
              <label className="form-check-label" htmlFor="gender">
                Male
              </label>
            </div>
            <div className="form-check custom-radio mb-2">
              <input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                id="1"
                name="gender"
                type="radio"
                className="form-check-input"
                required
              />
              <label className="form-check-label" htmlFor="gender">
                Female
              </label>
            </div>
          </div>
        </div>
        <button className="btn btn-primary sw-btn-next ms-1" onClick={onSubmit}>
          Next
        </button>
      </div>
    </section>
  );
};

export default StepOne;
