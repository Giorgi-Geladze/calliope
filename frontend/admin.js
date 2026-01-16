const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://calliope-backend.onrender.com";

const API_URL = `${BASE_URL}/calliope`;


window.onload = () => {
    renderAdminProducts();
};

async function addProduct() {
    if (!confirm("დაემატოს?")) return
    const password = prompt("enter the pass:");
    if (!password) return;

    const nameInput = document.getElementById("name");
    const priceInput = document.getElementById("price");
    const oldPriceInput = document.getElementById("oldPrice");
    const categoryInput = document.getElementById("category");
    const descInput = document.getElementById("description");
    const imageInput = document.getElementById("image");

    const file = imageInput.files[0];
    if (!file) return alert("აირჩიე ფოტო");

    const formData = new FormData(); 
    formData.append("name", nameInput.value);
    formData.append("price", priceInput.value);
    formData.append("oldPrice", oldPriceInput.value);
    formData.append("category", categoryInput.value);
    formData.append("description", descInput.value);
    formData.append("image", file);

    try {
        const response = await fetch(`${API_URL}/`, {
            method: 'POST',
            headers: {
                'admin-pass': password
            },
            body: formData
        });

        if (response.ok) {
            alert("პროდუქტი დაემატა ✅");
            nameInput.value = "";
            priceInput.value = "";
            imageInput.value = "";
            renderAdminProducts();
        } else {
            const errorData = await response.json();
            alert("Error: " + errorData.error);
        }
    } catch (error) {
        console.error("sending error:", error);
        alert("server error.");
    }
}

async function renderAdminProducts() {
    const adminList = document.getElementById("adminList");
    try {
        const response = await fetch(`${API_URL}/`);
        const result = await response.json()
        const products = result.data;

        adminList.innerHTML = "";
        products.forEach(p => {
            const card = document.createElement("div");
            card.className = "admin-card";
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteProduct('${p._id}')">✕</button>
                <img src="${BASE_URL}/img/${p.imageURL}">
                <h4>${p.name}</h4>
                <p>${p.price} GEL</p>
            `;
            adminList.appendChild(card);
        });
    } catch (error) {
        console.log("data is not fetched:", error);
    }
}

async function deleteProduct(id) {
if (!confirm("წაიშალოს?")) return
const password = prompt("enter the pass:");
if (!password) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
        headers: {
            'admin-pass': password
        }
    });

    if (response.ok){
      alert("წაიშალა");
      renderAdminProducts()
    } else {
      alert("არ წაიშალა")
    }
  } catch (error) {
    console.log("deleting error!")
  }
}