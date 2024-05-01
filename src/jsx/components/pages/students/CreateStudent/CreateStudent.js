import React, { Fragment, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import PageTitle from "../../../../layouts/PageTitle";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CreateStudent = () => {
  const [createdStudentId, setCreatedStudentId] = useState("");
  const [goSteps, setGoSteps] = useState(0);
  const { studentId } = useParams();
  const { t } = useTranslation();

  return (
    <Fragment>
      <PageTitle activeMenu="Components" motherMenu="Home" />
      <div className="row">
        <div className="col-xl-12 col-xxl-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">
                {t(studentId ? "editButton" : "createButton")}
              </h4>
            </div>
            <div className="card-body">
              <div className="form-wizard ">
                <Stepper
                  className="nav-wizard"
                  activeStep={goSteps}
                  label={false}
                >
                  <Step className="nav-link" onClick={() => setGoSteps(0)} />
                  <Step className="nav-link" onClick={() => setGoSteps(2)} />
                </Stepper>
                {goSteps === 0 && (
                  <StepOne
                    setGoSteps={setGoSteps}
                    setCreatedStudentId={setCreatedStudentId}
                  />
                )}
                {goSteps !== 0 && (
                  <StepTwo
                    studentId={studentId}
                    createdStudentId={createdStudentId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CreateStudent;
