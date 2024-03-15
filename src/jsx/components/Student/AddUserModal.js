import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import swal from "sweetalert";
import { getRolesQuery } from "../../../queries/index";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createUser, editUser } from "../../../api";

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

const AddUserModal = ({ isCreate, user, onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(1);
  const [rolesOptions, setRolesOptions] = useState([]);
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

  const { data: roles } = useQuery({
    ...getRolesQuery(),
  });

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
    if (!isValidEmail(email)) {
      errorObj.email = "Email is Required";
      error = true;
    }
    if (password === "" && !user) {
      errorObj.password = "Password is Required";
      error = true;
    }
    if (roleId === "") {
      errorObj.roleId = "Role id is Required";
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    (user ? editUser : createUser)(
      {
        firstName,
        lastName,
        email,
        roleId,
        password,
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
    if (roles?.result) {
      const options = roles.result.map((role) => ({
        value: role.id,
        label: role.name,
      }));
      setRolesOptions(options);
    }
  }, [roles]);

  useEffect(() => {
    if (user) {
      setRoleId(user.role?.id);
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
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
            <div className="form-group mb-3">
              <label>Role</label>
              <select
                className="form-control"
                onChange={(e) => setRoleId(e.target.value)}
              >
                {rolesOptions.map((role) => (
                  <option value={role.value}>{role.label}</option>
                ))}
              </select>
              {errors.role && (
                <div className="text-danger fs-12">{errors.role}</div>
              )}
            </div>
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
