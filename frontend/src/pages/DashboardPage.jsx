import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logoutUser } from '../services/authService';
import { createTransaction, deleteTransaction, fetchTransactions, updateTransaction } from '../services/transactionService';

const emptyForm = {
  title: '',
  amount: '',
  type: 'Expense',
  category: '',
  date: '',
  description: ''
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = getCurrentUser();

  const loadTransactions = async () => {
    try {
      const response = await fetchTransactions();
      setTransactions(response.data.transactions || []);
    } catch (err) {
      setError('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      if (editingId) {
        await updateTransaction(editingId, { ...form, amount: Number(form.amount) });
        setSuccess('Transaction updated');
      } else {
        await createTransaction({ ...form, amount: Number(form.amount) });
        setSuccess('Transaction added');
      }

      resetForm();
      await loadTransactions();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (transaction) => {
    setEditingId(transaction._id);
    setForm({
      title: transaction.title,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date.slice(0, 10),
      description: transaction.description || ''
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this transaction?');
    if (!confirmed) return;

    try {
      await deleteTransaction(id);
      setSuccess('Transaction deleted');
      await loadTransactions();
    } catch (err) {
      setError('Failed to delete transaction');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const totals = transactions.reduce(
    (acc, item) => {
      if (item.type === 'Income') acc.income += Number(item.amount);
      else acc.expenses += Number(item.amount);
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const balance = totals.income - totals.expenses;

  return (
    <div className="dashboard-page">
      <nav className="navbar">
        <h2>Expense Tracker</h2>
        <div className="navbar-actions">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <div className="dashboard-shell">
        <section className="summary-grid">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p>${totals.income.toFixed(2)}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>
            <p>${totals.expenses.toFixed(2)}</p>
          </div>
          <div className="summary-card balance">
            <h3>Current Balance</h3>
            <p>${balance.toFixed(2)}</p>
          </div>
        </section>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <section className="content-grid">
          <form className="transaction-form" onSubmit={handleSubmit}>
            <h3>{editingId ? 'Edit Transaction' : 'Add Transaction'}</h3>
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} required min="0" />
            <select name="type" value={form.type} onChange={handleChange}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
            <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <div className="form-actions">
              <button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update' : 'Add'}</button>
              {editingId && <button type="button" className="secondary" onClick={resetForm}>Cancel</button>}
            </div>
          </form>

          <div className="transactions-card">
            <h3>Recent Transactions</h3>
            {loading ? (
              <p>Loading...</p>
            ) : transactions.length === 0 ? (
              <p>No transactions yet.</p>
            ) : (
              <div className="transaction-list">
                {transactions.map((transaction) => (
                  <div key={transaction._id} className="transaction-item">
                    <div>
                      <strong>{transaction.title}</strong>
                      <p>{transaction.category}</p>
                      <small>{new Date(transaction.date).toLocaleDateString()}</small>
                    </div>
                    <div className="transaction-meta">
                      <span className={transaction.type === 'Income' ? 'income-pill' : 'expense-pill'}>${Number(transaction.amount).toFixed(2)}</span>
                      <div className="action-buttons">
                        <button onClick={() => handleEdit(transaction)}>Edit</button>
                        <button className="danger" onClick={() => handleDelete(transaction._id)}>Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
