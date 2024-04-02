import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getUnknownFacesQuery } from "../../../queries/index";
import { useState } from "react";
import settings from "../../../settings/settings";
import { deleteUnknownImage } from "../../../api";

function UnknownFaces() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [page, setPage] = useState(1);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: faces } = useQuery({
    ...getUnknownFacesQuery({
      PageIndex: page,
      PageSize: 10,
      DateFrom: "2023-09-01Z",
    }),
  });

  const onDeleteImage = (imageName) => {
    deleteUnknownImage(imageName).then(() => {
      queryClient.invalidateQueries(["unknown-faces"]);
    });
  };

  return (
    <>
      <div className="row">
        <div className="col-xl-12">
          <div className="row" style={{ rowGap: "5px" }}>
            <div className="col-xl-12">
              <div className="page-title flex-wrap">
                <div
                  className="dashboard_bar header-left"
                  style={{ textTransform: "capitalize", fontSize: "20px" }}
                >
                  {t("unknown-faces")}
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
                <button
                  className="btn btn-danger sw-btn-next ms-1 mt-3"
                  style={{ width: "100%" }}
                  onClick={() => onDeleteImage(image.id)}
                >
                  {t("delete")}
                </button>
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

export default UnknownFaces;
