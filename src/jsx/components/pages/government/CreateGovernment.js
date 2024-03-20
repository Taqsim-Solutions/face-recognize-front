import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import swal from "sweetalert";
import { useQuery } from "@tanstack/react-query";
import { getRegionsQuery } from "../../../../queries/index";
import {
  createGovernment,
  updateGovernment,
  getGovernment,
} from "../../../../api";
import { useNavigate, useParams } from "react-router-dom";

const GovernmentCreate = () => {
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [level, setLevel] = useState("");
  const [regionId, setRegionId] = useState("");
  const [cityId, setCityId] = useState("");
  const navigate = useNavigate();
  let errorsObj = {
    firstName: "",
    lastName: "",
    login: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "",
    regionId: "",
    cityId: "",
  };
  const { governmentsId } = useParams();
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const onSubmit = () => {
    let error = false;
    const errorObj = { ...errorsObj };

    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);

    (governmentsId ? updateGovernment : createGovernment)(
      governmentsId
        ? {
            firstName,
            lastName,
            login,
            email,
            level,
            regionId,
            cityId,
          }
        : {
            firstName,
            lastName,
            login,
            email,
            password,
            confirmPassword,
            level,
            regionId,
            cityId,
          },
      governmentsId
    )
      .then(() => {
        queryClient.invalidateQueries(["governments"]);
        navigate("/governments");
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    if (governmentsId) {
      getGovernment(governmentsId).then((res) => {
        setFirstName(res.result.firstName);
        setLastName(res.result.lastName);
        setEmail(res.result.email);
        setLogin(res.result.login);
        setLevel(res.result.level);
        setRegionId(res.result.regionId);
        setCityId(res.result.cityId);
      });
    }
  }, [governmentsId]);

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
        {!governmentsId && (
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
        <div className="form-group mb-3 col-lg-6">
          <label htmlFor="basic-url" className="form-label d-block">
            Region
          </label>
          <select
            className="form-control form-control-md"
            onChange={(e) => setRegionId(+e.target.value)}
            value={regionId}
          >
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
        <div class="mb-3 d-block col-lg-6">
          <label htmlFor="exampleFormControlInput2" class="form-label mb-2">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(+e.target.value)}
            className="form-control"
            id="sel1"
          >
            <option></option>
            <option value={3}>{"3"}</option>
            <option value={4}>{"4"}</option>
          </select>

          {errors.level && (
            <div className="text-danger fs-12">{errors.level}</div>
          )}
        </div>
        {regionId && (
          <div className="form-group mb-3 col-lg-6">
            <label htmlFor="basic-url" className="form-label d-block">
              District
            </label>
            <select
              className="form-control form-control-md"
              onChange={(e) => setCityId(+e.target.value)}
              value={cityId}
            >
              {regions?.result
                .filter((currentRegion) => +regionId === currentRegion.id)[0]
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

export default GovernmentCreate;
