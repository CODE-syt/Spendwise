import { useEffect, useMemo, useState } from "react";

const storageKey = (userId) => `spendwiseMonthlyBudget:${userId || "guest"}`;

function currentMonthPrefix() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function statusFor(percent) {
  if (percent >= 100) return { bar: "bg-red-600", label: "Over budget" };
  if (percent >= 80) return { bar: "bg-amber-500", label: "Close to the limit" };
  return { bar: "bg-green-600", label: "On track" };
}

function MonthlyBudget({ transactions, userId }) {
  const [limit, setLimit] = useState(0);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(storageKey(userId)));
      setLimit(Number.isFinite(saved) && saved > 0 ? saved : 0);
    } catch (error) {
      setLimit(0);
    }
  }, [userId]);

  const spentThisMonth = useMemo(() => {
    const prefix = currentMonthPrefix();
    return transactions
      .filter((t) => t.transactionType === "Expense" && String(t.date).startsWith(prefix))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const saveLimit = (event) => {
    event.preventDefault();
    const value = parseFloat(draft);
    const next = Number.isFinite(value) && value > 0 ? value : 0;
    setLimit(next);
    setEditing(false);
    try {
      if (next > 0) localStorage.setItem(storageKey(userId), String(next));
      else localStorage.removeItem(storageKey(userId));
    } catch (error) {
      // storage unavailable: the limit just lasts for this visit
    }
  };

  const percent = limit > 0 ? Math.round((spentThisMonth / limit) * 100) : 0;
  const status = statusFor(percent);
  const remaining = limit - spentThisMonth;

  return (
    <section
      aria-label="Monthly budget"
      className="w-full max-w-[430px] border border-border rounded bg-secondary-bg text-text p-4 flex flex-col gap-3 transition-colors"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg">This month's budget</h3>
        {!editing && (
          <button
            type="button"
            className="text-sm underline"
            onClick={() => {
              setDraft(limit > 0 ? String(limit) : "");
              setEditing(true);
            }}
          >
            {limit > 0 ? "Change limit" : "Set limit"}
          </button>
        )}
      </div>

      {editing && (
        <form onSubmit={saveLimit} className="flex gap-2">
          <input
            id="monthlyBudgetLimit"
            type="number"
            min="0"
            step="any"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Monthly limit in ₹"
            className="flex-1 border border-border rounded px-2 py-1 bg-transparent"
          />
          <button type="submit" className="px-3 py-1 rounded bg-primary-bg text-white">
            Save
          </button>
          <button type="button" className="px-2 py-1 underline" onClick={() => setEditing(false)}>
            Cancel
          </button>
        </form>
      )}

      {limit > 0 ? (
        <>
          <div
            className="h-3 w-full rounded bg-black/10 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(percent, 100)}
          >
            <div className={`h-full ${status.bar} transition-all`} style={{ width: `${Math.min(percent, 100)}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <span>
              &#x20B9;{spentThisMonth} of &#x20B9;{limit} ({percent}%)
            </span>
            <span>
              {status.label}
              {remaining >= 0 ? `, ₹${remaining} left` : `, ₹${Math.abs(remaining)} over`}
            </span>
          </div>
        </>
      ) : (
        !editing && <p className="text-sm">Set a monthly limit to see how your spending compares.</p>
      )}
    </section>
  );
}

export default MonthlyBudget;
