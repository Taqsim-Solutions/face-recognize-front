import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { getReportsQuery } from "../../../queries";
import Pagination from "../Pagination/Pagination";

const StudentDetails = () => {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState("10");
  const { t } = useTranslation();
  const { data: reports } = useQuery({
    ...getReportsQuery({
      PageIndex: page,
      PageSize: size,
      DateFrom: "2023-09-01Z",
    }),
  });

  return (
    <div className="row">
      <div className="col-xl-12">
        <div className="card h-auto">
          <div className="card-header border-0 p-3">
            <h4 className="heading mb-0">{t("reports")}</h4>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive basic-tbl">
              <div
                id="example-payment_wrapper"
                className="dataTables_wrapper no-footer"
              >
                <table id="example-payment" className="display w-100 dataTable">
                  <thead>
                    <tr>
                      <th style={{ fontWeight: 700 }}>{t("name")}</th>
                      <th style={{ fontWeight: 700 }}>{t("comingTime")}</th>
                      <th style={{ fontWeight: 700 }}>{t("leavingTime")}</th>
                      <th style={{ fontWeight: 700 }}>
                        {t("totalWorkDuration")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports?.result?.data.map((item, ind) => (
                      <tr key={ind}>
                        <td>
                          <h6 className="mb-0">{item.name}</h6>
                        </td>
                        <td>
                          {item.comingTime.slice(0, 10).split("-").join(".")}{" "}
                          <br />
                          {item.comingTime.slice(11, 19)}
                        </td>
                        <td>
                          {!item.leavingTime && "-"}
                          {item.leavingTime?.slice(0, 10).split("-").join(".")}
                          <br />
                          {item.leavingTime?.slice(11, 19)}
                        </td>
                        <td>{item.totalWorkDuration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <Pagination
                  onPageChange={(page) => setPage(page)}
                  totalPages={reports?.result.totalPages}
                  size={size}
                  setSize={setSize}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
