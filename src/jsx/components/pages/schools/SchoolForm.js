import { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import swal from "sweetalert";
import { getRegionsQuery } from "../../../../queries/index";
import { createSchool, editSchool } from "../../../../api";

const SchoolForm = ({ isCreate, school, onClose }) => {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [cityId, setCityId] = useState("");
  const [loading, setLoading] = useState(false);
  let errorsObj = {
    name: "",
    cityId: "",
  };
  const [errors, setErrors] = useState(errorsObj);
  const queryClient = useQueryClient();

  const { data: regions } = useQuery({
    ...getRegionsQuery(),
  });

  const onSubmit = () => {
    let error = false;
    const errorObj = { ...errorsObj };
    if (cityId === "") {
      errorObj.cityId = "City is Required";
      error = true;
    }
    if (name === "") {
      errorObj.name = "Name is Required";
      error = true;
    }
    setErrors(errorObj);
    if (error) {
      return;
    }
    setLoading(true);
    (school ? editSchool : createSchool)(
      {
        name,
        cityId,
      },
      school?.id
    )
      .then(() => {
        queryClient.invalidateQueries(["schools"]);
        onClose();
      })
      .catch((err) => {
        setLoading(false);
        swal("Oops", err.data.message, "error");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (school) {
      setCityId(school.region.cities[0].id);
      setName(school.name);
      setRegion(school.region.id);
    }
  }, [school]);

  return (
    <>
      <Modal onHide={onClose} show={isCreate || school} centered>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLabel">
              New school
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
                Name
              </label>
              <input
                type="text"
                className="form-control w-100"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.firstName && (
                <div className="text-danger fs-12">{errors.name}</div>
              )}
            </div>
            <div className="form-group mb-3">
              <label htmlFor="basic-url" className="form-label d-block">
                Region
              </label>
              <select
                className="form-control form-control-md"
                onChange={(e) => setRegion(e.target.value)}
                value={region}
              >
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
            {region && (
              <div className="form-group mb-3">
                <label htmlFor="basic-url" className="form-label d-block">
                  District
                </label>
                <select
                  className="form-control form-control-md"
                  onChange={(e) => setCityId(e.target.value)}
                  value={cityId}
                >
                  {regions?.result
                    .filter((currentRegion) => +region === currentRegion.id)[0]
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
              {school ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SchoolForm;
