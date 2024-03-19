import React, { Fragment, useState } from "react";
import { Stepper, Step } from "react-form-stepper";
import PageTitle from "../../../../layouts/PageTitle";
import StepOne from "./StepOne";
import StepTwo from "./StepTwo";

const CreateTeacher = () => {
  const [goSteps, setGoSteps] = useState(0);

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
                  <Step className="nav-link" onClick={() => setGoSteps(0)} />
                  <Step className="nav-link" onClick={() => setGoSteps(1)} />
                </Stepper>
                {goSteps === 0 && <StepOne />}
                {goSteps === 1 && <StepTwo />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default CreateTeacher;
