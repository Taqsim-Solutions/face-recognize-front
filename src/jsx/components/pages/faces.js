import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getFacesQuery } from "../../../queries/index";
import { useState } from "react";
import settings from "../../../settings/settings";

function Faces() {
  const [page, setPage] = useState(1);
  const { t } = useTranslation();

  const { data: faces } = useQuery({
    ...getFacesQuery({
      PageIndex: page,
      PageSize: 10,
      DateFrom: "2023-09-01Z",
    }),
  });

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row" style={{ rowGap: "10px" }}>
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{
                    textTransform: "capitalize",
                    fontSize: "20px",
                  }}
                >
                  {t("faces")}
                </div>
              </div>
            </div>
            {faces?.result?.data?.map((image) => (
              <div
                className="col-xl-2 card"
                style={{ marginLeft: "35px", padding: "10px" }}
              >
                <img
                  src={`${settings.baseURL}/images?filename=${image.imageName}`}
                  alt=""
                  style={{ width: "100%", borderRadius: "8px" }}
                />
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.imageName}
                </p>
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.time.slice(0, 10).split("-").join(".")}-{" "}
                  {image.time.slice(11, 19)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <div className="col-12 ps-3">
          <nav>
            <ul
              className="pagination pagination-gutter pagination-primary pagination-sm no-bg"
              style={{
                margin: "30px 0",
                display: "flex",
                justifyContent: "right",
              }}
            >
              <li className="page-item page-indicator">
                <p
                  className="page-link"
                  to="/email-inbox"
                  onClick={() => page > 0 && setPage(page - 1)}
                >
                  <i className="la la-angle-left"></i>
                </p>
              </li>
              {"page"
                .repeat(faces?.result.totalPages - 1)
                .split("page")
                .map((number, i) => (
                  <li
                    key={i}
                    className={`page-item  ${page === i + 1 ? "active" : ""} `}
                    onClick={() => setPage(i + 1)}
                  >
                    <p className="page-link" to="/email-inbox">
                      {i + 1}
                    </p>
                  </li>
                ))}

              <li className="page-item page-indicator">
                <p
                  className="page-link"
                  to="/email-inbox"
                  onClick={() =>
                    page + 1 < faces?.result.totalPages && setPage(page + 1)
                  }
                >
                  <i className="la la-angle-right"></i>
                </p>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}

export default Faces;
