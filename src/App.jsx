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
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    brand: '',
    material: 'PLA',
    color: '',
colorHex: '#808080',  
    weight: '1000',
    cost: '',
    quantity: '1'
  });
 const [materials, setMaterials] = useState(() => {
    const defaults = [
      'PLA', 'PLA+', 'PLA 2.0', 'PETG', 'PETG HF',
      'PETG 2.0', 'ABS', 'ASA', 'TPU', 'PA', 'PC',
      'PVA', 'Other'
    ];

    try {
      const saved = JSON.parse(
        localStorage.getItem('filamentMaterials')
      ) || [];

      return [...new Set([...defaults, ...saved])];
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem('filamentMaterials', JSON.stringify(materials));
  }, [materials]);
  const [brands, setBrands] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem('filamentBrands')) || [];
  } catch {
    return [];
  }
});

useEffect(() => {
  localStorage.setItem('filamentBrands', JSON.stringify(brands));
}, [brands]);
  const [colors, setColors] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('filamentColors')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('filamentColors', JSON.stringify(colors));
  }, [colors]);
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
if (
  form.material.trim() &&
  !materials.includes(form.material.trim())
) {
  setMaterials(old => [...old, form.material.trim()]);
}
   
    if (!form.brand.trim() || !form.color.trim() ||
        weight <= 0 || cost < 0 || quantity <= 0) return;
const newBrand = form.brand.trim();

setBrands(old =>
  old.some(b => b.toLowerCase() === newBrand.toLowerCase())
    ? old
    : [...old, newBrand]
);
    const newColor = form.color.trim();

setColors(old =>
  old.some(c => c.toLowerCase() === newColor.toLowerCase())
    ? old
    : [...old, newColor]
);
   const newSpools = Array.from({ length: quantity }, () => ({
  id: crypto.randomUUID(),
  brand: form.brand.trim(),
  material: form.material,
  color: form.color.trim(),
  colorHex: form.colorHex,
  weight,
  remaining: weight,
  cost,
  quantity: 1
}));

setInventory(old => [...old, ...newSpools]);

    setForm({
      brand: '',
      material: 'PLA',
      color: '',
colorHex: '#808080',
      weight: '1000',
      cost: '',
      quantity: '1'
    });

    setShowForm(false);
  }
  function updateFilament(e) {
  e.preventDefault();

  const weight = Number(form.weight);
  const cost = Number(form.cost);

  if (
    !form.brand.trim() ||
    !form.material.trim() ||
    !form.color.trim() ||
    weight <= 0 ||
    cost < 0
  ) {
    return;
  }

  setInventory(old =>
    old.map(item =>
      item.id === editingId
        ? {
            ...item,
            brand: form.brand.trim(),
            material: form.material.trim(),
            color: form.color.trim(),
            colorHex: form.colorHex,
            weight,
            cost
          }
        : item
    )
  );

  setEditingId(null);
  setShowForm(false);
}
  function handleEdit(item) {
    setForm({
      brand: item.brand,
      material: item.material,
      color: item.color,
      colorHex: item.colorHex || '#808080',
      weight: String(item.weight),
      cost: String(item.cost),
      quantity: '1'
    });

    setEditingId(item.id);
    setShowForm(true);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this spool? This cannot be undone.')) {
      return;
    }

    setInventory(old => old.filter(item => item.id !== id));
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
              <InventoryTable
  items={filtered.slice(0, 8)}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
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
            <InventoryTable
  items={filtered}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
          </section>
        )}

        {page === 'Printers' && (
          <section className="panel">
            <h2>Connected Printers</h2>
            <div className="printer">
              <strong>Bambu Lab P2S + AMS 2 pro</strong>
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
            <form
  className="form"
  onSubmit={editingId ? updateFilament : addFilament}
>
              <h2>{editingId ? 'Edit Filament' : 'Add Filament'}</h2>

            <label>Brand</label>
<select
  value={brands.includes(form.brand) ? form.brand : '__custom__'}
  onChange={e => {
    if (e.target.value === '__custom__') {
      setForm({...form, brand: ''});
    } else {
      setForm({...form, brand: e.target.value});
    }
  }}
  required
>
  <option value="">Select Brand</option>
  {brands.map(brand => (
    <option key={brand} value={brand}>{brand}</option>
  ))}
  <option value="__custom__">+ Add New Brand</option>
</select>

{(!brands.includes(form.brand) || form.brand === '') && (
  <input
    required
    placeholder="Type new brand"
    value={form.brand}
    onChange={e => setForm({...form, brand: e.target.value})}
  />
)}

              <label>Material</label>
              <div>
  <select
    value={materials.includes(form.material) ? form.material : '__custom__'}
    onChange={e => {
      if (e.target.value === '__custom__') {
        setForm({...form, material: ''});
      } else {
        setForm({...form, material: e.target.value});
      }
    }}
  >
    {materials.map(m => (
      <option key={m} value={m}>{m}</option>
    ))}
    <option value="__custom__">+ Add New Material Type</option>
  </select>

  {form.material === '' && (
    <input
      type="text"
      placeholder="Type new material"
      value={form.material}
      onChange={e => setForm({...form, material: e.target.value})}
    />
  )}
</div>

              <label>Color</label>
<select
  value={colors.includes(form.color) ? form.color : '__custom__'}
  onChange={e => {
    if (e.target.value === '__custom__') {
      setForm({...form, color: ''});
    } else {
      setForm({...form, color: e.target.value});
    }
  }}
  required
>
  <option value="">Select Color</option>
  {colors.map(color => (
    <option key={color} value={color}>{color}</option>
  ))}
  <option value="__custom__">+ Add New Color</option>
</select>

{(!colors.includes(form.color) || form.color === '') && (
  <input
    required
    placeholder="Type new color"
    value={form.color}
    onChange={e => setForm({...form, color: e.target.value})}
  />
)}
<label>Choose Actual Color</label>
<div className="color-picker-row">
  <input
    type="color"
    value={form.colorHex}
    onChange={e =>
      setForm({...form, colorHex: e.target.value})
    }
  />
  <span>{(form.colorHex || '#808080').toUpperCase()}</span>
</div>
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
                  onClick={() => setonClick={() => {
  setShowForm(false);
  setEditingId(null);
}}ShowForm(false)}>Cancel</button>
                <button className="primary" type="submit">Save Filament</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

function InventoryTable({ items, onEdit, onDelete }) {
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
        <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.brand}</td>
              <td>{item.material}</td>
              <td>
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <span
      style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        borderRadius: '4px',
        backgroundColor: item.colorHex || '#808080',
        border: '1px solid #999'
      }}
    />
    {item.color}
  </div>
</td>
              <td>{item.remaining} g</td>
              <td>${item.cost.toFixed(2)}</td>
           <td>
  <button
    type="button"
    className="secondary"
    onClick={() => onEdit(item)}
  >
    Edit
  </button>

  <button
    type="button"
    className="secondary"
    onClick={() => onDelete(item.id)}
  >
    Delete
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
