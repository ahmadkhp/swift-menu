import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Dashboard() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const fetchMenu = async () => {
    const res = await axios.get("http://localhost:3001/menu/" + id);
    setItems(res.data);
  };

  const fetchOrders = async () => {
    const res = await axios.get("http://localhost:3001/orders/" + id);
    setOrders(res.data);
  };

  const addItem = async () => {
    await axios.post("http://localhost:3001/item", { restaurant_id: id, name, price });
    fetchMenu();
  };

  const markDone = async (order_id) => {
    await axios.post("http://localhost:3001/order/done", { order_id });
    fetchOrders();
  };

  useEffect(() => {
    fetchMenu();
    fetchOrders();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <input placeholder="Item name" onChange={e => setName(e.target.value)} />
      <input placeholder="Price" onChange={e => setPrice(e.target.value)} />
      <button onClick={addItem}>Add Item</button>
      <h3>Menu Items</h3>
      <ul>
        {items.map(item => (
          <li key={item.id}>{item.name} - ${item.price}</li>
        ))}
      </ul>
      <h3>Orders</h3>
      <ul>
        {orders.map(order => (
          <li key={order.id}>
            {order.phone} - Status: {order.status}<br/>
            Items: {JSON.parse(order.items).map(i => i.name).join(", ")}<br/>
            {order.status === "pending" && (
              <button onClick={() => markDone(order.id)}>Mark as Done</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
