import { render, screen } from "@testing-library/react";
import MonthlyBudget from "./MonthlyBudget";

const thisMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
};

beforeEach(() => localStorage.clear());

test("shows spending against the saved limit and ignores other months and income", () => {
  localStorage.setItem("spendwiseMonthlyBudget:u1", "1000");
  const transactions = [
    { transactionType: "Expense", amount: 850, date: thisMonth() },
    { transactionType: "Expense", amount: 500, date: "2001-01-01" },
    { transactionType: "Income", amount: 9000, date: thisMonth() },
  ];
  render(<MonthlyBudget transactions={transactions} userId="u1" />);
  expect(screen.getByText(/850 of .*1000 \(85%\)/)).toBeTruthy();
  expect(screen.getByText(/Close to the limit/)).toBeTruthy();
});

test("asks for a limit when none is saved", () => {
  render(<MonthlyBudget transactions={[]} userId="u2" />);
  expect(screen.getByText(/Set a monthly limit/)).toBeTruthy();
});
