import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IMAGES, SVGICON } from "../Dashboard/Content";
import { Dropdown } from "react-bootstrap";

import profile from "./../../../images/profile.svg";
import location from "./../../../images/svg/location.svg";
import phone from "./../../../images/svg/phone.svg";
import email from "./../../../images/svg/email.svg";
import { useQuery } from "@tanstack/react-query";
import { getMeQuery } from "../../../queries/index";
import settings from "../../../settings/settings";

const scheduleBlog = [
  {
    title: "World History",
    subtitle: "Class VII-B",
    image: IMAGES.avat1,
    color: "schedule-card",
  },
  {
    title: "Ancient History",
    subtitle: "Class VII-A",
    image: IMAGES.avat2,
    color: "schedule-card-1",
  },
  {
    title: "Culture",
    subtitle: "Class VIII-A",
    image: IMAGES.avat3,
    color: "schedule-card-2",
  },
  {
    title: "World History",
    subtitle: "Class VII-C",
    image: IMAGES.avat4,
    color: "schedule-card-3",
  },
];

const basicDetail = [
  { title: "Username", subtitle: "Justin Hope", image: profile, key: "login" },
  //   { title: "Address", subtitle: "Jakarta, Indonesia", image: location },
  //   { title: "Phone", subtitle: "+12 345 6789 0", image: phone },
  { title: "Email", subtitle: "Historia@mail.com", image: email, key: "email" },
];

const TeachersDetail = () => {
  const { data: user } = useQuery({
    ...getMeQuery(),
  });

  return (
    user && (
      <div className="row">
        <div className="col-xl-9">
          <div className="card h-auto">
            <div className="card-header p-0">
              <div className="user-bg w-100">
                <div className="user-svg">
                  <svg
                    width="264"
                    height="109"
                    viewBox="0 0 264 109"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="8.01074"
                      y="8.6521"
                      width="247.592"
                      height="259.13"
                      rx="123.796"
                      stroke="#FCC43E"
                      stroke-width="16"
                    />
                  </svg>
                </div>
                <div className="user-svg-1">
                  <svg
                    width="264"
                    height="59"
                    viewBox="0 0 264 59"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="8"
                      y="8.56406"
                      width="247.592"
                      height="259.13"
                      rx="123.796"
                      stroke="#FB7D5B"
                      stroke-width="16"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div className="user">
                  <div className="user-media">
                    <img
                      src={`${settings.baseURL}/images?filename=${user?.result?.mainImageName}`}
                      alt=""
                      className="avatar avatar-xxl"
                    />
                  </div>
                  <div>
                    <h2 className="mb-0">{`${user?.result?.firstName} ${user?.result?.lastName}`}</h2>
                    <p className="text-primary font-w600">
                      {user?.result?.level === 1
                        ? `Teacher (${user?.result?.region?.name}, ${user?.result?.city?.name}, ${user?.result?.school?.name})`
                        : user?.result?.level === 2
                        ? `Director (${user?.result?.region?.name}, ${user?.result?.city?.name}, ${user?.result?.school?.name})`
                        : user?.result?.level === 3
                        ? `District Government (${user?.result?.city?.name})`
                        : user?.result?.level === 4
                        ? `Region Government (${user?.result?.region?.name})`
                        : "Admin"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="row mt-2">
                {basicDetail.map((item, ind) => (
                  <div className="col-xl-3 col-xxl-6 col-sm-6" key={ind}>
                    <ul className="student-details">
                      <li className="me-2">
                        <Link to={"#"} className="icon-box bg-secondary">
                          <img src={item.image} alt="" />
                        </Link>
                      </li>
                      <li>
                        <span>{item.title}:</span>
                        <h5 className="mb-0">{user?.result?.[item.key]}</h5>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* <div className="card h-auto">
            <div className="card-body">
              <div className="teacher-deatails">
                <h3 className="heading">About</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat.{" "}
                </p>
                <h3 className="heading">Education:</h3>
                <ul>
                  <li className="dots">
                    <h6 className="mb-1">
                      History Major, University Akademi Historia
                    </h6>
                    <span>2013-2017</span>
                  </li>
                  <li className="dots">
                    <h6>Master of History, University Akademi Historia</h6>
                    <span>2013-2017</span>
                  </li>
                </ul>
                <h3 className="heading mt-4">Expertise:</h3>
                <p>World History, Philosophy, Prehistoric, Culture, Ancient</p>
              </div>
            </div>
          </div> */}
        </div>
        {/* <div className="col-xl-3">
          <div className="row">
            <div className="col-xl-12">
              <div className="card h-auto">
                <div className="card-body">
                  <h3 className="heading">Schedule Details</h3>
                  <p className="mb-0">Thursday, 10th April , 2022</p>
                </div>
              </div>
            </div>
            {scheduleBlog.map((data, index) => (
              <div className="col-xl-12 col-sm-6" key={index}>
                <div className={`card h-auto ${data.color}`}>
                  <div className="card-body">
                    <h4 className="mb-0">{data.title}</h4>
                    <p>{data.subtitle}</p>
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <ul>
                          <li className="mb-2">
                            {SVGICON.calndar} July 20, 2023
                          </li>
                          <li>{SVGICON.watch} 09.00 - 10.00 AM</li>
                        </ul>
                      </div>
                      <div>
                        <img
                          src={data.image}
                          className="avatar avatar-lg"
                          alt=""
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="col-xl-12">
              <Link
                to={"#"}
                className="btn btn-primary btn-block light btn-rounded mb-5"
              >
                View More
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    )
  );
};

export default TeachersDetail;
