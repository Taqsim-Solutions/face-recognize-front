import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getFacesQuery } from "../../../queries/index";
import { useState } from "react";
import settings from "../../../settings/settings";
import Pagination from "../Pagination/Pagination";

function Faces() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState("10");
  const { t } = useTranslation();

  const { data: faces } = useQuery({
    ...getFacesQuery({
      PageIndex: page,
      PageSize: size,
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
                  style={{
                    width: "100%",
                    borderRadius: "8px",
                    height: "170px",
                    objectFit: "cover",
                  }}
                />
                <p
                  style={{
                    marginTop: "10px",
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.student
                    ? `${image.student.firstName} ${image.student.lastName}`
                    : `${image.teacher?.firstName || ""} ${
                        image.teacher?.lastName || ""
                      }`}
                </p>
                <p
                  style={{
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {image.time.slice(0, 10).split("-").join(".")}-{" "}
                  {image.time.slice(11, 19)}
                </p>
                <p
                  style={{
                    marginBottom: "0",
                    textAlign: "center",
                  }}
                >
                  {t("class")}:{" "}
                  {image?.student
                    ? image?.student?.className
                    : `${image?.teacher?.class?.degree || ""}-${
                        image?.teacher?.class?.symbol || ""
                      }`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Pagination
        onPageChange={(page) => setPage(page)}
        totalPages={faces?.result.totalPages}
        size={size}
        setSize={setSize}
      />
    </>
  );
}

export default Faces;
