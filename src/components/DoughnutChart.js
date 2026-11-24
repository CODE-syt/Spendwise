import React, { useContext, useMemo } from "react";
import Chart from "react-apexcharts";
import { ThemeContext } from "../context/ThemeContext";
import "../styles/DoughnutChart.css";
import "../index.css";

export const EXPENSE_CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Others"];

function DoughnutChart({ transactions }) {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  const totals = useMemo(() => {
    const sums = Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, 0]));
    (transactions || []).forEach((t) => {
      if (t.transactionType === "Expense" && t.category in sums) {
        sums[t.category] += t.amount;
      }
    });
    return sums;
  }, [transactions]);

  const series = EXPENSE_CATEGORIES.map((c) => totals[c]);
  const hasExpenses = series.some((value) => value > 0);

  return (
    <div className="chart_container pb-5">
      {hasExpenses ? (
        <Chart
          type="donut"
          width="100%"
          height="450"
          series={series}
          options={{
            labels: EXPENSE_CATEGORIES,
            legend: {
              position: "bottom",
              labels: { colors: isDark ? "#B6CEFC80" : "#000" },
            },
            stroke: { colors: isDark ? ["#B6CEFC80"] : ["#fff"] },
          }}
        />
      ) : (
        <p>Add your expenses to see meaningful insights here!</p>
      )}
    </div>
  );
}

export default DoughnutChart;
