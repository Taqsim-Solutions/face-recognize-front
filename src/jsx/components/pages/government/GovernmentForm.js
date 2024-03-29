import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { createGovernment, updateGovernment } from "../../../../api/index";
import { getRegionsQuery } from "../../../../queries/index";
import { useTranslation } from "react-i18next";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const GovernmentModal = ({ isCreate, user, onClose }) => {
  const [isDistrict, setIsDistrict] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  let errorsObj = {
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    password: "",
  };
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
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
    if (!isValidEmail(email)) {
      errorObj.email = `${t("email")} ${t("isRequired")}`;
      error = true;
    }
    if (password === "" && !user) {
      errorObj.password = `${t("password")} ${t("isRequired")}`;
      error = true;
    }
    if (regionId && isDistrict && !cityId) {
      errorObj.cityId = `${t("city")} ${t("isRequired")}`;
      error = true;
    }
    if (login === "") {
      errorObj.login = `${t("username")} ${t("isRequired")}`;
      error = true;
    }
    if (regionId === "") {
      errorObj.regionId = `${t("region")} ${t("isRequired")}`;
      error = true;
    }

    if (password.length < 6) {
      errorObj.password = `${t("passwordLength")}`;
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (user ? updateGovernment : createGovernment)(
      {
        firstName,
        lastName,
        email,
        password,
        login,
        regionId,
        cityId: isDistrict ? cityId : null,
        ConfirmPassword: password,
        level: isDistrict ? 3 : 4,
      },
      user?.id
    )
      .then(() => {
        queryClient.invalidateQueries(["users"]);
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setLogin(user.login);
      setRegionId(user.region?.id);
      setCityId(user.city?.id);
    }
  }, [user]);

  return (
    <>
      <Modal onHide={onClose} show={isCreate} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {`${t("createButton")}`}
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
                {t("uploadImage")}
              </label>
              <input
                accept="image/*"
                className="form-control"
                type="file"
                id="formFile"
                onChange={(e) => setAvatar(e.target.files[0])}
              />
            </div>
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("firstName")}
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder={t("firstName")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <div className="text-danger fs-12">{errors.firstName}</div>
              )}
            </div>
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("lastName")}
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder={t("lastName")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <div className="text-danger fs-12">{errors.lastName}</div>
              )}
            </div>
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("username")}
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder={t("username")}
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              {errors.login && (
                <div className="text-danger fs-12">{errors.login}</div>
              )}
            </div>
            <div class="mb-3 d-block">
              <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleFormControlInput2"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <div className="text-danger fs-12">{errors.email}</div>
              )}
            </div>
            {!user && (
              <div class="mb-3 d-block">
                <label
                  htmlFor="exampleFormControlInput2"
                  class="form-label mb-2"
                >
                  {t("password")}
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="exampleFormControlInput2"
                  placeholder={t("password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.password && (
                  <div className="text-danger fs-12">{errors.password}</div>
                )}
              </div>
            )}
            <div class="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                {t("region")}
              </label>
              <select
                className="form-control form-control-md"
                onChange={(e) => setRegionId(e.target.value)}
                value={regionId}
              >
                <option value="">{t("select")}</option>
                {regions?.result?.map((option) => (
                  <option value={option.id} key={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.regionId && (
                <div className="text-danger fs-12">{errors.regionId}</div>
              )}
            </div>
            {!user && (
              <div className="col-lg-6 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={isDistrict}
                    onChange={(e) => setIsDistrict(e.target.checked)}
                  />
                  <label className="form-check-label font-w400">
                    {t("checkDistrictGovernment")}
                  </label>
                </div>
              </div>
            )}
            {regionId && isDistrict && (
              <div class="mb-3 d-block">
                <label htmlFor="basic-url" className="form-label d-block">
                  {t("district")}
                </label>
                <select
                  className="form-control form-control-md"
                  onChange={(e) => setCityId(e.target.value)}
                  value={cityId}
                >
                  <option value="">{t("select")}</option>
                  {regions?.result
                    .filter(
                      (currentRegion) => +regionId === currentRegion.id
                    )[0]
                    ?.cities?.map((option) => (
                      <option value={option.id} key={option.name}>
                        {option.name}
                      </option>
                    ))}
                </select>
                {errors.cityId && (
                  <div className="text-danger fs-12">{errors.cityId}</div>
                )}
              </div>
            )}
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
              onClick={onSubmit}
              disabled={loading}
            >
              {user ? t("saveButton") : t("createButton")}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default GovernmentModal;
