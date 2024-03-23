import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { createGovernment, updateGovernment } from "../../../../api/index";
import { getRegionsQuery } from "../../../../queries/index";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const GovernmentModal = ({ isCreate, user, onClose }) => {
  const [isTop, setIsTop] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
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

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
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
    (user ? updateGovernment : createGovernment)(
      {
        firstName,
        lastName,
        email,
        password,
        login,
        regionId,
        cityId: isTop ? cityId : "",
        ConfirmPassword: password,
        level: isTop ? 3 : 4,
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
              New user
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
                Upload image
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
            <div class="mb-3 d-block">
              <label htmlFor="basic-url" className="form-label d-block">
                Region
              </label>
              <select
                className="form-control form-control-md"
                onChange={(e) => setRegionId(e.target.value)}
                value={regionId}
              >
                <option value="">Select region</option>
                {regions?.result?.map((option) => (
                  <option value={option.id} key={option.name}>
                    {option.name}
                  </option>
                ))}
              </select>
              {errors.class && (
                <div className="text-danger fs-12">{errors.class}</div>
              )}
            </div>
            {regionId && (
              <div class="mb-3 d-block">
                <label htmlFor="basic-url" className="form-label d-block">
                  District
                </label>
                <select
                  className="form-control form-control-md"
                  onChange={(e) => setCityId(e.target.value)}
                  value={cityId}
                >
                  <option value="">Select district</option>
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
                {errors.class && (
                  <div className="text-danger fs-12">{errors.class}</div>
                )}
              </div>
            )}
            {!user && (
              <div className="col-lg-6 mb-2">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={isTop}
                    onChange={(e) => setIsTop(e.target.checked)}
                  />
                  <label className="form-check-label font-w400">
                    Region government
                  </label>
                </div>
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

export default GovernmentModal;
