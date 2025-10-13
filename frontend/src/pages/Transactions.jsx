import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, PlusCircle, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient, { handleApiError } from '../api/apiClient.js';
import Loader from '../components/Loader.jsx';
import useAuth from '../hooks/useAuth.js';
import { CURRENCY_OPTIONS, DEFAULT_CURRENCY, formatCurrency } from '../utils/currency.js';

const createEmptyForm = (currency = DEFAULT_CURRENCY) => ({
  type: 'expense',
  amount: '',
  currency,
  category: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  notes: '',
});

const TransactionsPage = () => {
  const { user } = useAuth();
  const userCurrency = user?.preferences?.currency || DEFAULT_CURRENCY;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => createEmptyForm(userCurrency));
  const [filters, setFilters] = useState({ type: 'all', query: '' });
  const [editingId, setEditingId] = useState(null);
  const [aiState, setAiState] = useState({ loading: false, confidence: null });
  const [baseCurrency, setBaseCurrency] = useState(userCurrency);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/transactions');
      setTransactions(data.transactions);
      setBaseCurrency(data.currency || userCurrency);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setBaseCurrency(userCurrency);
    if (!editingId) {
      setForm((prev) => ({
        ...prev,
        currency: prev.currency || userCurrency,
      }));
    }
  }, [userCurrency, editingId]);

  useEffect(() => {
    if (form.description.trim().length > 3 && !editingId) {
      const timeout = setTimeout(async () => {
        try {
          setAiState({ loading: true, confidence: null });
          const { data } = await apiClient.post('/ai/categorize', {
            description: form.description,
            type: form.type,
          });
          setForm((prev) => ({
            ...prev,
            category: prev.category || data.category,
          }));
          setAiState({ loading: false, confidence: data.confidence });
        } catch (error) {
          console.warn('AI categorization failed:', handleApiError(error));
          setAiState({ loading: false, confidence: null });
        }
      }, 450);

      return () => clearTimeout(timeout);
    }
    return undefined;
  }, [form.description, form.type, editingId]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      ...form,
      amount: Number(form.amount),
      date: new Date(form.date),
      tags: [],
    };

    try {
      if (editingId) {
        const { data } = await apiClient.put(`/transactions/${editingId}`, payload);
        setTransactions((prev) => prev.map((item) => (item._id === editingId ? data.transaction : item)));
        toast.success('Transaction updated');
      } else {
        const { data } = await apiClient.post('/transactions', payload);
        setTransactions((prev) => [data.transaction, ...prev]);
        toast.success('Transaction added');
      }
      setForm(createEmptyForm(userCurrency));
      setEditingId(null);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setSubmitting(false);
      setAiState({ loading: false, confidence: null });
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      type: transaction.type,
      amount: transaction.amount,
      currency: transaction.currency || userCurrency,
      category: transaction.category,
      description: transaction.description || '',
      date: transaction.date ? transaction.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: transaction.notes || '',
    });
    setAiState({ loading: false, confidence: transaction.aiConfidence ?? null });
  };

  const handleDelete = async (transactionId) => {
    try {
      await apiClient.delete(`/transactions/${transactionId}`);
      setTransactions((prev) => prev.filter((item) => item._id !== transactionId));
      toast.success('Transaction removed');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      if (filters.type !== 'all' && txn.type !== filters.type) return false;
      if (
        filters.query &&
        !`${txn.description} ${txn.category}`.toLowerCase().includes(filters.query.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const resetForm = () => {
    setForm(createEmptyForm(userCurrency));
    setEditingId(null);
    setAiState({ loading: false, confidence: null });
  };

  const exportCsv = () => {
    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/transactions/export/csv`, '_blank');
  };

  if (loading && transactions.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {editingId ? 'Update transaction' : 'Add new entry'}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Track your {form.type === 'income' ? 'income' : 'spending'}
            </h2>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Default currency: {baseCurrency}
            </p>
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-2xl border border-slate-200/60 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-200"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Type
            </label>
            <select
              value={form.type}
              onChange={handleChange('type')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Amount
            </label>
            <input
              type="number"
              min="0"
              required
              value={form.amount}
              onChange={handleChange('amount')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Currency
            </label>
            <select
              value={form.currency}
              onChange={handleChange('currency')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.symbol} {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={handleChange('description')}
              placeholder="e.g. Bought protein shake"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span>Category</span>
              {aiState.loading && <span className="text-[10px] text-brand">Thinking…</span>}
              {aiState.confidence && (
                <span className="text-[10px] text-brand">AI confidence {(aiState.confidence * 100).toFixed(0)}%</span>
              )}
            </label>
            <input
              type="text"
              value={form.category}
              onChange={handleChange('category')}
              placeholder="Category"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={handleChange('date')}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={handleChange('notes')}
              placeholder="Optional notes"
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/40 transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-brand/50"
            >
              <PlusCircle className="h-4 w-4" />
              {editingId ? 'Update transaction' : 'Add transaction'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-slate-200/70 px-4 py-3 text-sm text-slate-500 transition hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel rounded-3xl border-none p-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-1 flex-wrap gap-3">
            <select
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
              className="rounded-2xl border border-white/40 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            >
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
              placeholder="Search description or category"
              className="flex-1 rounded-2xl border border-white/40 bg-white/80 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-white"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{filteredTransactions.length} item(s)</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/40 dark:border-slate-800">
          <table className="min-w-full divide-y divide-white/40 dark:divide-slate-800">
            <thead className="bg-white/70 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/70 dark:text-slate-400">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium text-right">Amount</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40 bg-white/60 text-sm text-slate-600 dark:divide-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-5 text-center text-sm text-slate-400">
                    No transactions yet. Add your first entry above.
                  </td>
                </tr>
              )}
              {filteredTransactions.map((txn) => (
                <tr key={txn._id} className="transition hover:bg-white/80 dark:hover:bg-slate-800/40">
                  <td className="px-6 py-4">{new Date(txn.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        txn.type === 'income'
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'
                      }`}
                    >
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{txn.category}</td>
                  <td className="px-6 py-4">{txn.description || '—'}</td>
                  <td className="px-6 py-4 text-right font-semibold">
                    {txn.type === 'expense' ? '-' : '+'}
                    {formatCurrency(txn.amount, txn.currency || baseCurrency)}
                    <span className="ml-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                      {txn.currency || baseCurrency}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(txn)}
                        className="rounded-full border border-slate-200/70 p-2 text-slate-500 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                        aria-label="Edit transaction"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(txn._id)}
                        className="rounded-full border border-rose-200/70 p-2 text-rose-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-rose-900 dark:text-rose-300"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  );
};

export default TransactionsPage;
