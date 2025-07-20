import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Menu() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [phone, setPhone] = useState("");

  useEffect(() => {
    axios.get("http://localhost:3001/menu/" + id).then(res => setItems(res.data));
  }, [id]);

  const addToCart = (item) => {
    setCart([...cart, item]);
  };

  const placeOrder = async () => {
    await axios.post("http://localhost:3001/order", {
      restaurant_id: id,
      phone,
      items: cart
    });
    alert("Order placed!");
    setCart([]);
    setPhone("");
  };

  return (
    <div>
      <h2>Menu</h2>
      <input placeholder="Phone number" value={phone} onChange={e => setPhone(e.target.value)} />
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - ${item.price}
            <button onClick={() => addToCart(item)}>Add</button>
          </li>
        ))}
      </ul>
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}

export default Menu;
