import React, { Fragment, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import PageTitle from "../../../../layouts/PageTitle";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";
import { useParams } from "react-router-dom";

const CreateTeacher = () => {
  const [goSteps, setGoSteps] = useState(0);
  const { teacherId } = useParams();

  return (
    <Fragment>
      <PageTitle activeMenu="Components" motherMenu="Home" />

      <div className="row">
        <div className="col-xl-12 col-xxl-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title">Create teacher</h4>
            </div>
            <div className="card-body">
              <div className="form-wizard ">
                <Stepper
                  className="nav-wizard"
                  activeStep={goSteps}
                  label={false}
                >
                  <Step
                    className="nav-link"
                    onClick={() => teacherId && setGoSteps(0)}
                  />
                  <Step className="nav-link" onClick={() => setGoSteps(1)} />
                </Stepper>
                {goSteps === 0 && <StepOne setGoSteps={setGoSteps} />}
                {goSteps !== 0 && (
                  <StepTwo setGoSteps={setGoSteps} id={goSteps} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CreateTeacher;
