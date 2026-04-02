import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ProductManagement = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product A', price: '₹500', category: 'Electronics', stock: 45 },
    { id: 2, name: 'Product B', price: '₹1,200', category: 'Clothing', stock: 78 },
    { id: 3, name: 'Product C', price: '₹300', category: 'Books', stock: 120 },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '', description: '' });

  const handleAddProduct = () => {
    if (formData.name && formData.price && formData.category && formData.stock) {
      setProducts([...products, { ...formData, id: Date.now() }]);
      setFormData({ name: '', price: '', category: '', stock: '', description: '' });
      setShowForm(false);
    }
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Product Management</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f9fafb' }}>
          <h2>Add New Product</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div>
              <label>Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                className="form-control"
              />
            </div>
            <div>
              <label>Price</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="₹ Price"
                className="form-control"
              />
            </div>
            <div>
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="form-control"
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Books">Books</option>
                <option value="Food">Food</option>
              </select>
            </div>
            <div>
              <label>Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="Stock quantity"
                className="form-control"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                className="form-control"
                rows="3"
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button className="btn btn-primary" onClick={handleAddProduct}>Save Product</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>Products List</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <button className="btn btn-sm" style={{ marginRight: '0.5rem', padding: '0.4rem 0.8rem' }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="btn btn-sm" style={{ padding: '0.4rem 0.8rem' }} onClick={() => handleDelete(product.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductManagement;
