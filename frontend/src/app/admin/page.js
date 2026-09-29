"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminOrdersQuery,
  useGenerateProductDescriptionMutation,
} from "@/store/api/api";

const initialForm = {
  title: "",
  description: "",
  price: "",
  image: "",
  category: "",
  stock: "",
};

function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, hydrated } = useSelector((state) => state.auth);
  const shouldLoadAdminData = hydrated && isAuthenticated && user?.role === "admin";
  const { data: productData, isLoading: productsLoading } = useGetProductsQuery();
  const { data: statsData, isLoading: statsLoading } = useGetAdminStatsQuery(undefined, {
    skip: !shouldLoadAdminData,
  });
  const { data: usersData, isLoading: usersLoading } = useGetAdminUsersQuery(undefined, {
    skip: !shouldLoadAdminData,
  });
  const { data: ordersData, isLoading: ordersLoading } = useGetAdminOrdersQuery(undefined, {
    skip: !shouldLoadAdminData,
  });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [generateProductDescription, { isLoading: isGeneratingDescription }] =
    useGenerateProductDescriptionMutation();
  const [form, setForm] = useState(initialForm);
  const [notification, setNotification] = useState("");
  const [modal, setModal] = useState(null);
  const [editProduct, setEditProduct] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", price: "", stock: "" });


  useEffect(() => {
    if (hydrated && (!isAuthenticated || user?.role !== "admin")) {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated || !isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const products = productData?.data || [];
  const users = usersData?.data || [];
  const orders = ordersData?.data || [];
  const stats = statsData?.data || {
    totalUsers: 0,
    totalProducts: products.length,
    totalOrders: 0,
    totalSales: 0,
  };
  const totalStock = products.reduce((total, product) => total + (product.stock || 0), 0);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 2500);
  };

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("Please select an image file.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      showNotification("Image must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((previous) => ({
        ...previous,
        image: reader.result,
      }));
      showNotification("Image selected.");
    };

    reader.readAsDataURL(file);
  };

  const handleGenerateDescription = async () => {
    if (!form.title.trim()) {
      showNotification("Enter a product title first.");
      return;
    }

    try {
      const result = await generateProductDescription({
        title: form.title.trim(),
        category: form.category.trim(),
      }).unwrap();

      setForm((previous) => ({
        ...previous,
        description: result.data.description,
      }));

      showNotification("Description generated.");
    } catch (error) {
      showNotification(error?.data?.message || "Failed to generate description.");
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();

    try {
      await createProduct({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        image: form.image,
        category: form.category.trim() || "general",
        stock: Number(form.stock),
      }).unwrap();

      setForm(initialForm);
      showNotification("Product created successfully.");
    } catch (error) {
      showNotification(error?.data?.message || "Failed to create product.");
    }
  };

  const handleUpdate = (product) => {
    setEditProduct(product);
    setEditForm({
      title: product.title,
      price: product.price,
      stock: product.stock,
    });
    setModal("update");
  };

  const saveUpdate = async () => {
    try {
      await updateProduct({
        id: editProduct._id,
        title: editForm.title.trim(),
        price: Number(editForm.price),
        stock: Number(editForm.stock),
      }).unwrap();

      setModal(null);
      setEditProduct(null);
      showNotification("Product updated successfully.");
    } catch (error) {
      showNotification(error?.data?.message || "Failed to update product.");
    }
  };

  const handleDelete = (id) => {
    setEditProduct(products.find((product) => product._id === id));
    setModal("delete");
  };

  const confirmDelete = async () => {
    try {
      await deleteProduct(editProduct._id).unwrap();

      setModal(null);
      setEditProduct(null);
      showNotification("Product deleted successfully.");
    } catch (error) {
      showNotification(error?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="section-label">SHOPIN ADMIN</p>
          <h1>Store Dashboard</h1>
          <p>Manage products, users, orders and store activity.</p>
        </div>

        <div className="admin-user">
          <span className="profile-circle">
            {user?.firstName?.charAt(0)?.toUpperCase() || "A"}
          </span>
          <div>
            <strong>{user?.firstName} {user?.lastName}</strong>
            <span>@{user?.username}</span>
          </div>
        </div>
      </section>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>Users</span>
          <strong>{statsLoading ? "..." : stats.totalUsers}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Products</span>
          <strong>{statsLoading ? "..." : stats.totalProducts}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Orders</span>
          <strong>{statsLoading ? "..." : stats.totalOrders}</strong>
        </article>

        <article className="admin-stat-card">
          <span>Total Sales</span>
          <strong>
            ₹{statsLoading ? "..." : Number(stats.totalSales || 0).toLocaleString("en-IN")}
          </strong>
        </article>
      </section>

      <section className="admin-overview-grid">
        <article className="admin-overview-card">
          <span>Total Inventory</span>
          <strong>{totalStock}</strong>
          <small>Units currently in stock</small>
        </article>

        <article className="admin-overview-card">
          <span>Admin Access</span>
          <strong>Active</strong>
          <small>RBAC protected</small>
        </article>

        <article className="admin-overview-card">
          <span>Store Status</span>
          <strong>Live</strong>
          <small>Products available to users</small>
        </article>
      </section>

      {notification && (
        <div
          className="shopin-notification"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "16px 24px",
            borderRadius: "14px",
            background: "#111827",
            color: "#ffffff",
            boxShadow: "0 18px 50px rgba(0, 0, 0, 0.22)",
            fontSize: "15px",
            fontWeight: "600",
            textAlign: "center",
            maxWidth: "calc(100vw - 32px)",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: "#22c55e",
              color: "#ffffff",
              flexShrink: 0,
              fontSize: "16px",
            }}
          >
            ✓
          </span>
          {notification}
        </div>
      )}

      <section className="admin-form">
        <div className="admin-section-heading">
          <div>
            <p className="section-label">INVENTORY</p>
            <h2>Add Product</h2>
          </div>
        </div>

        <form onSubmit={handleCreate}>
          <div className="admin-form-grid">
            <label>
              Product title
              <input
                name="title"
                placeholder="Product title"
                value={form.title}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Category
              <input
                name="category"
                placeholder="electronics"
                value={form.category}
                onChange={handleChange}
              />
            </label>

            <label>
              Price
              <input
                name="price"
                type="number"
                min="0"
                placeholder="999"
                value={form.price}
                onChange={handleChange}
                required
              />
            </label>

            <label>
              Stock
              <input
                name="stock"
                type="number"
                min="0"
                placeholder="20"
                value={form.stock}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-form-wide">
              Product Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />

              {form.image && (
                <div className="admin-upload-preview">
                  <img src={form.image} alt="Product preview" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((previous) => ({
                        ...previous,
                        image: "",
                      }))
                    }
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </label>

            <label className="admin-form-wide">
              Description
              <textarea
                name="description"
                placeholder="Describe the product..."
                value={form.description}
                onChange={handleChange}
                rows="3"
              />

              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGeneratingDescription}
              >
                {isGeneratingDescription
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
            </label>
          </div>

          <button type="submit" disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Product"}
          </button>
        </form>
      </section>

      <section className="admin-products">
        <div className="admin-section-heading">
          <div>
            <p className="section-label">CATALOG</p>
            <h2>Products</h2>
          </div>
          <span>
            {products.length} product{products.length !== 1 ? "s" : ""}
          </span>
        </div>

        {productsLoading && <p>Loading products...</p>}

        {!productsLoading && products.length === 0 && (
          <div className="admin-empty">
            <h3>No products yet.</h3>
            <p>Create your first product above.</p>
          </div>
        )}

        <div className="admin-product-list">
          {products.map((product) => (
            <article key={product._id} className="admin-product-row">
              <div className="admin-product-info">
                <div className="admin-product-image">
                  {product.image ? (
                    <img src={product.image} alt={product.title} />
                  ) : (
                    <span>—</span>
                  )}
                </div>

                <div>
                  <strong>{product.title}</strong>
                  <span>{product.category}</span>
                </div>
              </div>

              <div className="admin-product-meta">
                <strong>₹{product.price}</strong>
                <span>Stock: {product.stock}</span>
              </div>

              <div className="admin-product-actions">
                <button
                  type="button"
                  onClick={() => handleUpdate(product)}
                  disabled={isUpdating || isDeleting}
                >
                  Update
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  disabled={isUpdating || isDeleting}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-table-section">
        <div className="admin-section-heading">
          <div>
            <p className="section-label">USERS</p>
            <h2>Registered Users</h2>
          </div>
          <span>{users.length} users</span>
        </div>

        {usersLoading ? (
          <p>Loading users...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>

              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td>{item.firstName} {item.lastName}</td>
                    <td>@{item.username}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className="role-badge">{item.role}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="admin-table-section">
        <div className="admin-section-heading">
          <div>
            <p className="section-label">ORDERS</p>
            <h2>Recent Orders</h2>
          </div>
          <span>{orders.length} orders</span>
        </div>

        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="admin-empty">
            <h3>No orders yet.</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td>
                      {order.user?.firstName || "User"}{" "}
                      {order.user?.lastName || ""}
                    </td>
                    <td>
                      ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td>{order.status}</td>
                    <td>{order.paymentStatus}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modal === "delete" && (
        <div className="modal-overlay">
          <div className="action-modal">
            <span className="modal-icon">!</span>
            <h3>Delete product?</h3>
            <p>
              Are you sure you want to delete &quot;{editProduct?.title}&quot;?
            </p>

            <div className="modal-actions">
              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>

              <button
                type="button"
                className="danger-button"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "update" && (
        <div className="modal-overlay">
          <div className="action-modal">
            <span className="modal-icon">✎</span>
            <h3>Update product</h3>

            <label>
              Product title
              <input
                value={editForm.title}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    title: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Price
              <input
                type="number"
                min="0"
                value={editForm.price}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    price: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Stock
              <input
                type="number"
                min="0"
                value={editForm.stock}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    stock: event.target.value,
                  })
                }
              />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setModal(null)}>
                Cancel
              </button>

              <button
                type="button"
                onClick={saveUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );

}

export default AdminPage;
