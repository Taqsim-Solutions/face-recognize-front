import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { useQuery } from "@tanstack/react-query";
import { getClassesQuery, getSchoolsQuery } from "../../../../../queries/index";
import {
  createTeacher,
  updateTeacher,
  getTeacher,
  deleteUserPhoto,
  changeTeacherMainImage,
} from "../../../../../api";
import { useNavigate, useParams } from "react-router-dom";
import settings from "../../../../../settings/settings";
import { getRegionsQuery, getMeQuery } from "../../../../../queries/index";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { NewPassword } from "./NewPassword";

const StepOne = ({ setGoSteps }) => {
  const [mainImage, setMainImage] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [lastName, setLastName] = useState("");
  const [classId, setClassId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [reflesh, setReflesh] = useState(0);
  const [passwordModal, setOpenPasswordModal] = useState(false);
  const { t } = useTranslation();
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

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const { data: classes } = useQuery({
    ...getClassesQuery({ PageSize: "1000", SchoolId: schoolId }),
  });

  const { data: schools } = useQuery({
    ...getSchoolsQuery({ PageSize: "1000", RegionId: region, CityId: cityId }),
  });

  const { data: user } = useQuery({
    ...getMeQuery(),
  });

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
    if (email === "") {
      errorObj.email = `${t("email")} ${t("isRequired")}`;
      error = true;
    }
    if (login === "") {
      errorObj.login = `${t("username")} ${t("isRequired")}`;
      error = true;
    }
    if (classId === "" && !teacherId && !isDirector) {
      errorObj.class = `${t("class")} ${t("isRequired")}`;
      error = true;
    }
    if (schoolId === "" && !teacherId) {
      errorObj.school = `${t("school")} ${t("isRequired")}`;
      error = true;
    }
    if (password === "" && !teacherId) {
      errorObj.password = `${t("password")} ${t("isRequired")}`;
      error = true;
    }
    if (region === "" && !teacherId) {
      errorObj.region = `${t("region")} ${t("isRequired")}`;
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
          setGoSteps(teacherId || res?.result?.id);
        }
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  const fetchTeacher = () => {
    getTeacher(teacherId).then((res) => {
      setFirstName(res.result.firstName);
      setLastName(res.result.lastName);
      setEmail(res.result.email);
      setSchoolId(`${schoolId}`);
      setLogin(res.result.login);
      setImages(res.result.imageIds);
      setMainImage(res.result.mainImageName);
    });
  };

  const onDeleteImage = (imageName) => {
    deleteUserPhoto(imageName).then(() => {
      queryClient.invalidateQueries(["teachers"]);
      setReflesh(reflesh + 1);
    });
  };

  const handleMainPhoto = (id, imageName) => {
    changeTeacherMainImage(id, imageName)
      .then(() => {
        queryClient.invalidateQueries(["teachers"]);
        fetchTeacher();
      })
      .catch(() => alert("error"));
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
      fetchTeacher();
    }
  }, [teacherId, reflesh]);

  useEffect(() => {
    if (user?.result?.region?.id) {
      setRegion(user.result.region.id);
    }
    if (user?.result?.city?.id) {
      setCityId(user.result.city.id);
    }
    if (user?.result?.school?.id) {
      setSchoolId(user.result.school.id);
    }
  }, [user]);

  return (
    <section>
      <div className="row">
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
          <div className="mb-3 d-block">
            <label htmlFor="basic-url" className="form-label d-block">
              {t("username")}
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
              {t("email")}
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
              {t("password")}
            </label>
            <input
              type="password"
              className="form-control"
              id="exampleFormControlInput2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <div className="text-danger fs-12">{errors.password}</div>
            )}
          </div>
        )}
        {!user?.result?.region?.id && !teacherId && (
          <div className="col-lg-6 mb-2">
            <label htmlFor="basic-url" className="form-label d-block">
              {t("region")}
            </label>
            <select
              className="form-control form-control-md"
              onChange={(e) => setRegion(e.target.value)}
              value={region}
            >
              <option value="">{t("select")}</option>
              {regions?.result?.map((option) => (
                <option value={option.id} key={option.name}>
                  {option.name}
                </option>
              ))}
            </select>
            {errors.region && (
              <div className="text-danger fs-12">{errors.regionId}</div>
            )}
          </div>
        )}
        {region && !user?.result?.region?.id && (
          <div className="col-lg-6 mb-2">
            <label htmlFor="basic-url" className="form-label d-block">
              {t("district")}
            </label>
            <select
              className="form-control form-control-md"
              onChange={(e) => setCityId(e.target.value)}
              value={cityId}
            >
              <option value="">{t("district")}</option>
              {regions?.result
                .filter((currentRegion) => +region === currentRegion.id)[0]
                ?.cities?.map((option) => (
                  <option value={option.id} key={option.name}>
                    {option.name}
                  </option>
                ))}
            </select>
            {errors.class && (
              <div className="text-danger fs-12">{errors.cityId}</div>
            )}
          </div>
        )}
        {!teacherId && cityId && !user?.result?.school?.id && (
          <div className="col-lg-6 mb-2">
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("school")}
              </label>
              <Select
                defaultValue={schoolId}
                onChange={(e) => setSchoolId(e.value)}
                options={schoolValues}
                placeholder={t("select")}
              />
              {errors.school && (
                <div className="text-danger fs-12">{errors.school}</div>
              )}
            </div>
          </div>
        )}
        {!teacherId && !isDirector && schoolId && (
          <div className="col-lg-6 mb-2">
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("class")}
              </label>
              <Select
                defaultValue={classId}
                onChange={(e) => setClassId(e.value)}
                options={classesValues}
                placeholder={t("select")}
              />
              {errors.class && (
                <div className="text-danger fs-12">{errors.class}</div>
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
              <label className="form-check-label font-w400">
                {t("isDirector")}
              </label>
            </div>
          </div>
        )}
        {teacherId && images?.length > 0 && (
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
                  onClick={() => handleMainPhoto(teacherId, image)}
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
        {teacherId &&
          (user?.result?.level === 2 || user?.result?.level === 5) && (
            <p
              style={{
                textDecoration: "underline",
                color: "blue",
                cursor: "pointer",
              }}
              onClick={() => setOpenPasswordModal(teacherId)}
            >
              {t("new_password")}
            </p>
          )}
        <NewPassword
          id={passwordModal}
          onClose={() => setOpenPasswordModal(false)}
        />
        <button
          className="btn btn-primary sw-btn-next ms-1"
          onClick={onSubmit}
          style={{ marginTop: "20px" }}
          disabled={loading}
        >
          {t("nextButton")}
        </button>
      </div>
    </section>
  );
};

export default StepOne;
