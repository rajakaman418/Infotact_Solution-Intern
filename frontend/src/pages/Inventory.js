import { useEffect, useState } from "react";
import axios from "axios";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const token = localStorage.getItem("token");

  const fetchProducts = () => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/products`, {
        headers: { Authorization: token },
      })
      .then((res) => setProducts(res.data.products || []))
      .catch(() => setProducts([]));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Inventory List</h1>

      <div className="bg-white shadow rounded p-4">
        <table className="w-full text-center border">
          <thead className="bg-gray-200">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
            </tr>
          </thead>

          <tbody>
            {products.length > 0 ? (
              products.map((p, i) => (
                <tr key={p._id} className="border-t">
                  <td>{i + 1}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.stock}</td>
                  <td>₹{p.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}