import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { createUser, editUser } from "../../../api";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const AddUserModal = ({ isCreate, user, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
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
      errorObj.firstName = "First Name is Required";
      error = true;
    }
    if (lastName === "") {
      errorObj.lastName = "Last Name is Required";
      error = true;
    }
    if (!isValidEmail(email)) {
      errorObj.email = "Email is Required";
      error = true;
    }
    if (password === "" && !user) {
      errorObj.password = "Password is Required";
      error = true;
    }
    if (login === "") {
      errorObj.login = "Login is Required";
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
        level: 5,
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
    }
  }, [user]);

  return (
    <>
      <Modal onHide={onClose} show={isCreate} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              New user
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
                First name
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              {errors.firstName && (
                <div className="text-danger fs-12">{errors.firstName}</div>
              )}
            </div>
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                Last name
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              {errors.lastName && (
                <div className="text-danger fs-12">{errors.lastName}</div>
              )}
            </div>
            <div className="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                Login
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder="Login"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
              {errors.login && (
                <div className="text-danger fs-12">{errors.login}</div>
              )}
            </div>
            <div class="mb-3 d-block">
              <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleFormControlInput2"
                placeholder="Email"
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
              onClick={onSubmit}
              disabled={loading}
            >
              {user ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddUserModal;
