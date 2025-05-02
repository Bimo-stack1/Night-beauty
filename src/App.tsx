import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm p-4 flex justify-between items-center border-b">
        <h2 className="text-xl font-semibold accent-text">المخزن</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster />
    </div>
  );
}

type Item = {
  _id: Id<"items">;
  name: string;
  price: number;
  quantity: number;
  category: string;
};

function Content() {
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");

  const items = useQuery(api.items.list);
  const searchResults = useQuery(api.items.search, { query: search });
  const addItem = useMutation(api.items.add);
  const updateItem = useMutation(api.items.update);
  const removeItem = useMutation(api.items.remove);

  const displayItems = search ? searchResults : items;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateItem({
          id: editItem._id,
          name,
          price: Number(price),
          quantity: Number(quantity),
          category,
        });
        setEditItem(null);
        toast.success("تم تحديث العنصر");
      } else {
        await addItem({
          name,
          price: Number(price),
          quantity: Number(quantity),
          category,
        });
        toast.success("تم إضافة العنصر");
      }
      setName("");
      setPrice("");
      setQuantity("");
      setCategory("");
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  const handleEdit = (item: Item) => {
    setEditItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setQuantity(item.quantity.toString());
    setCategory(item.category);
  };

  const handleDelete = async (id: Id<"items">) => {
    try {
      await removeItem({ id });
      toast.success("تم حذف العنصر");
    } catch (err) {
      toast.error("حدث خطأ");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <Authenticated>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="اسم المنتج"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="السعر"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="number"
              placeholder="الكمية"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <input
              type="text"
              placeholder="الفئة"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              {editItem ? "تحديث" : "إضافة"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-right">اسم المنتج</th>
                  <th className="p-2 text-right">السعر</th>
                  <th className="p-2 text-right">الكمية</th>
                  <th className="p-2 text-right">الفئة</th>
                  <th className="p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {displayItems?.map((item) => (
                  <tr key={item._id} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.price}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">{item.category}</td>
                    <td className="p-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-500 ml-2"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="text-center">
          <h1 className="text-5xl font-bold accent-text mb-4">نظام إدارة المخزون</h1>
          <p className="text-xl text-slate-600">سجل دخول للبدء</p>
        </div>
        <SignInForm />
      </Unauthenticated>
    </div>
  );
}
