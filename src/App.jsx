import React, { useState, useEffect } from 'react';

const initialInventory = [];

export default function App() {
  const [inventory, setInventory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('filamentInventory')) || initialInventory;
    } catch {
      return initialInventory;
    }
  });

  const [page, setPage] = useState('Dashboard');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    brand: '',
    material: 'PLA',
    color: '',
    weight: '1000',
    cost: '',
    quantity: '1'
  });

  useEffect(() => {
    localStorage.setItem('filamentInventory', JSON.stringify(inventory));
  }, [inventory]);

  const totalSpools = inventory.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const totalWeight = inventory.reduce(
    (sum, item) => sum + item.remaining * item.quantity, 0
  );

  const totalValue = inventory.reduce(
    (sum, item) => sum + item.remaining * item.cost / item.weight * item.quantity, 0
  );

  function addFilament(e) {
    e.preventDefault();

    const weight = Number(form.weight);
    const cost = Number(form.cost);
    const quantity = Number(form.quantity);

    if (!form.brand.trim() || !form.color.trim() ||
        weight <= 0 || cost < 0 || quantity <= 0) return;

    setInventory(old => [...old, {
      id: crypto.randomUUID(),
      brand: form.brand.trim(),
      material: form.material,
      color: form.color.trim(),
      weight,
      remaining: weight,
      cost,
      quantity
    }]);

    setForm({
      brand: '',
      material: 'PLA',
      color: '',
      weight: '1000',
      cost: '',
      quantity: '1'
    });

    setShowForm(false);
  }

  const filtered = inventory.filter(item =>
    `${item.brand} ${item.material} ${item.color}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const averageCost = {};
  inventory.forEach(item => {
    const key = `${item.brand}|||${item.material}`;
    if (!averageCost[key]) averageCost[key] = { cost: 0, weight: 0 };
    averageCost[key].cost += item.cost * item.quantity;
    averageCost[key].weight += item.weight * item.quantity;
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>🧵 Filament Manager</h2>
        <p className="subtitle">3D PRINTING INVENTORY</p>

        {['Dashboard', 'Inventory', 'Printers', 'Settings'].map(item => (
          <button
            key={item}
            className={page === item ? 'nav active' : 'nav'}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}

        <div className="sidebar-footer">Version 1.0</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>{page}</h1>
            <p>Manage your 3D printing materials</p>
          </div>
          <button className="primary" onClick={() => setShowForm(true)}>
            + Add Filament
          </button>
        </header>

        {page === 'Dashboard' && (
          <>
            <section className="stats">
              <div className="stat">
                <span>Total Spools</span>
                <strong>{totalSpools}</strong>
              </div>
              <div className="stat">
                <span>Filament Remaining</span>
                <strong>{(totalWeight / 1000).toFixed(2)} kg</strong>
              </div>
              <div className="stat">
                <span>Inventory Value</span>
                <strong>${totalValue.toFixed(2)}</strong>
              </div>
            </section>

            <section className="panel">
              <h2>Recent Inventory</h2>
              <InventoryTable items={filtered.slice(0, 8)} />
            </section>
          </>
        )}

        {page === 'Inventory' && (
          <section className="panel">
            <div className="panel-heading">
              <h2>Filament Inventory</h2>
              <input
                placeholder="Search brand, material or color..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <InventoryTable items={filtered} />
          </section>
        )}

        {page === 'Printers' && (
          <section className="panel">
            <h2>Connected Printers</h2>
            <div className="printer">
              <strong>Bambu Lab P1S + AMS</strong>
              <p>Automatic usage tracking: Planned</p>
            </div>
            <div className="printer">
              <strong>Snapmaker U1</strong>
              <p>Automatic usage tracking: Planned</p>
            </div>
          </section>
        )}

        {page === 'Settings' && (
          <section className="panel">
            <h2>Settings</h2>
            <p>Inventory data is currently saved in this browser.</p>
            <p>Windows 11 companion integration: Planned.</p>
          </section>
        )}

        {showForm && (
          <div className="modal">
            <form className="form" onSubmit={addFilament}>
              <h2>Add Filament</h2>

              <label>Brand</label>
              <input required value={form.brand}
                onChange={e => setForm({...form, brand: e.target.value})} />

              <label>Material</label>
              <select value={form.material}
                onChange={e => setForm({...form, material: e.target.value})}>
                {['PLA', 'PLA+', 'PETG', 'PETG HF', 'ABS', 'ASA',
                  'TPU', 'PA', 'PC', 'PVA', 'Other'].map(m =>
                  <option key={m}>{m}</option>
                )}
              </select>

              <label>Color</label>
              <input required value={form.color}
                onChange={e => setForm({...form, color: e.target.value})} />

              <label>Original spool weight (grams)</label>
              <input required type="number" min="1" value={form.weight}
                onChange={e => setForm({...form, weight: e.target.value})} />

              <label>Purchase price ($)</label>
              <input required type="number" min="0" step="0.01"
                value={form.cost}
                onChange={e => setForm({...form, cost: e.target.value})} />

              <label>Quantity purchased</label>
              <input required type="number" min="1" value={form.quantity}
                onChange={e => setForm({...form, quantity: e.target.value})} />

              <div className="form-actions">
                <button type="button" className="secondary"
                  onClick={() => setShowForm(false)}>Cancel</button>
                <button className="primary" type="submit">Save Filament</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function InventoryTable({ items }) {
  if (!items.length) return <p className="empty">No filament added yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Brand</th>
            <th>Material</th>
            <th>Color</th>
            <th>Remaining</th>
            <th>Purchase Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.brand}</td>
              <td>{item.material}</td>
              <td>{item.color}</td>
              <td>{item.remaining} g</td>
              <td>${item.cost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
