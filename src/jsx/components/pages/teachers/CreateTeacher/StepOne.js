import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { useQuery } from "@tanstack/react-query";
import { getClassesQuery, getSchoolsQuery } from "../../../../../queries/index";
import { createTeacher, updateTeacher, getTeacher } from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";

const StepOne = ({ setGoSteps }) => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [classId, setClassId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [isDirector, setIsDirector] = useState(false);
  let errorsObj = {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    login: "",
    school: "",
  };
  const { teacherId } = useParams();
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [classesValues, setClassesValues] = useState([]);
  const [schoolValues, setSchoolValues] = useState([]);

  const { data: classes } = useQuery({
    ...getClassesQuery({ size: "100" }),
  });

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ size: "100" }),
  });

  const onSubmit = () => {
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
    if (email === "") {
      errorObj.email = "Email is Required";
      error = true;
    }
    if (login === "") {
      errorObj.login = "Login is Required";
      error = true;
    }
    if (classId === "" && !teacherId) {
      errorObj.class = "Class is Required";
      error = true;
    }
    if (schoolId === "" && !teacherId) {
      errorObj.school = "Class is Required";
      error = true;
    }
    if (password === "" && !teacherId) {
      errorObj.password = "Password is Required";
      error = true;
    }

    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (teacherId ? updateTeacher : createTeacher)(
      teacherId
        ? {
            firstName,
            lastName,
            login,
            email,
          }
        : {
            firstName,
            lastName,
            login,
            email,
            password,
            classId: +classId,
            schoolId: +schoolId,
            isDirectorOrAssistandDirector: isDirector,
          },
      teacherId
    )
      .then((res) => {
        queryClient.invalidateQueries(["teachers"]);
        if (res.result.mainImageName) {
          navigate("/teachers");
        } else {
          setGoSteps(teacherId);
        }
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (classes?.result) {
      const options = classes.result.data.map((option) => ({
        label: `${option.degree}-${option.symbol}`,
        value: option.id,
      }));
      setClassesValues(options);
    }
  }, [classes]);

  useEffect(() => {
    if (schools?.result) {
      const options = schools.result.data.map((option) => ({
        label: option.name,
        value: option.id,
      }));
      setSchoolValues(options);
    }
  }, [schools]);

  useEffect(() => {
    if (teacherId) {
      getTeacher(teacherId).then((res) => {
        setFirstName(res.result.firstName);
        setLastName(res.result.lastName);
        setEmail(res.result.email);
        setSchoolId(`${schoolId}`);
        setLogin(res.result.login);
      });
    }
  }, [teacherId]);

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
          <div className="mb-3 d-block">
            <label htmlFor="basic-url" className="form-label d-block">
              Login
            </label>
            <input
              type="text"
              className="form-control w-100"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
            {errors.login && (
              <div className="text-danger fs-12">{errors.login}</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-2">
          <div class="mb-3 d-block">
            <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="exampleFormControlInput2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <div className="text-danger fs-12">{errors.email}</div>
            )}
          </div>
        </div>
        {!teacherId && (
          <div class="mb-3 d-block col-lg-6">
            <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
              Password
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleFormControlInput2"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <div className="text-danger fs-12">{errors.password}</div>
            )}
          </div>
        )}
        {!teacherId && (
          <div className="col-lg-6 mb-2">
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                Class
              </label>
              <select
                className="form-control form-control-md"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {classesValues.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.class && (
                <div className="text-danger fs-12">{errors.class}</div>
              )}
            </div>
          </div>
        )}
        {!teacherId && (
          <div className="col-lg-6 mb-2">
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                School
              </label>
              <select
                className="form-control form-control-md"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              >
                {schoolValues.map((option) => (
                  <option value={option.value} key={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.school && (
                <div className="text-danger fs-12">{errors.school}</div>
              )}
            </div>
          </div>
        )}
        {!teacherId && (
          <div className="col-lg-6 mb-2">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value={isDirector}
                onChange={(e) => setIsDirector(e.target.checked)}
              />
              <label className="form-check-label font-w400">Director</label>
            </div>
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
