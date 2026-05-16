import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { createUser, editUser } from "../../../api";
import { useTranslation } from "react-i18next";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const AddUserModal = ({ isCreate, user, onClose }) => {
  const { t } = useTranslation();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [level, setLevel] = useState(5);
  const [loading, setLoading] = useState(false);
  let errorsObj = {
    firstName: "",
    lastName: "",
    email: "",
    roleId: "",
    password: "",
  };
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

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
      errorObj.password = `${t("passport")} ${t("isRequired")}`;
      error = true;
    }
    if (login === "") {
      errorObj.login = `${t("username")} ${t("isRequired")}`;
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (user ? editUser : createUser)(
      {
        firstName,
        lastName,
        email,
        password,
        login,
        level: parseInt(level),
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
      setLevel(user.level || 5);
    }
  }, [user]);

  return (
    <>
      <Modal onHide={onClose} show={isCreate} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              {user
                ? `${t("editButton")} ${t("user")}`
                : `${t("createButton")} ${t("user")}`}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
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
            <div className="mb-3 d-block">
              <label htmlFor="roleSelect" className="form-label mb-2">
                {t("role")}
              </label>
              <select
                className="form-control"
                id="roleSelect"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
              >
                <option value={1}>{t("Teacher")}</option>
                <option value={2}>{t("Director")}</option>
                <option value={3}>{t("District government")}</option>
                <option value={4}>{t("Region government")}</option>
                <option value={5}>{t("Admin")}</option>
              </select>
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

export default AddUserModal;
