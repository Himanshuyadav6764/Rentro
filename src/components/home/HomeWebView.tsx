const categories = [
  { label: "Books", icon: "books" },
  { label: "Laptops", icon: "laptop" },
  { label: "Calculators", icon: "calc" },
  { label: "Phones", icon: "phone" },
  { label: "Essentials", icon: "home" },
];

const products = [
  { title: "Engineering Books", price: 20, deposit: 100 },
  { title: "Casio-Calculator", price: 10, deposit: 50 },
  { title: "Dell Laptop", price: 100, deposit: 300 },
  { title: "Durable Backpack", price: 285, deposit: 100 },
  { title: "Computer Notes", price: 15, deposit: 50 },
];

export function HomeWebView() {
  return (
    <div className="min-h-screen w-full border border-[#cdd8ee] bg-[#f7f9ff]/95">
      <header className="border-b border-[#c9d5ee] px-8 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md border border-[#b9cade] bg-[#d8f0e3] font-semibold text-[#1e8057]">
              S
            </span>
            <p className="text-[42px] font-semibold tracking-tight text-[#1a4a9a]">StudentRental</p>
          </div>

          <div className="flex items-center gap-6 text-[20px] text-[#21539f]">
            <span>mic</span>
            <span className="relative">
              bell
              <span className="absolute -top-2 -right-3 rounded-full bg-[#ff6b45] px-1.5 text-[10px] text-white">1</span>
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#d7e7ff] text-[12px]">usr</span>
          </div>
        </div>

        <div className="flex items-center rounded-lg border border-[#bfcceb] bg-white px-4 py-3 text-[#6f7ea2]">
          <span className="mr-3 text-[22px]">search</span>
          <input
            readOnly
            value="Search books, calculators, laptops..."
            className="w-full bg-transparent text-[34px] outline-none"
          />
          <span className="ml-3 text-[22px]">mic</span>
        </div>
      </header>

      <main className="px-8 pt-4 pb-2 text-[#1f2f55]">
        <p className="mb-3 text-[36px] font-medium">pin Columbia Hostel Area v</p>

        <section className="mb-5 flex flex-wrap gap-3">
          {categories.map((category) => (
            <div key={category.label} className="w-[112px] text-center">
              <div className="mb-1 grid h-[78px] place-items-center rounded-md bg-[#e8edf8] text-[18px] text-[#53648d]">
                {category.icon}
              </div>
              <p className="text-[34px] leading-tight">{category.label}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 rounded-lg border border-[#c9e7da] bg-[#e9f5ef] px-4 py-3">
          <p className="text-[44px] font-semibold text-[#205245]">Your Trust Score: 78</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="text-[36px] text-[#365f54]">Improve score to reduce deposit | TrustRent AI</p>
            <span className="text-[36px] text-[#24528f]">{">"}</span>
          </div>
        </section>

        <section className="mb-4">
          <div className="mb-2 flex items-center justify-between text-[#1c4a96]">
            <h2 className="text-[46px] font-semibold">Featured Rentals</h2>
            <button className="text-[42px] font-semibold">View All {">"}</button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {products.map((product) => (
              <article key={product.title} className="rounded-md border border-[#d6deee] bg-white p-2">
                <div className="mb-2 h-[94px] rounded-sm bg-[#d9e0ee]" />
                <p className="line-clamp-2 text-[39px] leading-tight font-medium text-[#283861]">{product.title}</p>
                <p className="text-[41px] font-semibold text-[#1f2f57]">Rs {product.price} /day</p>
                <p className="text-[38px] text-[#2e3f66]">Deposit: Rs {product.deposit}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-3 border-t border-[#c9d5ee] px-10 py-3">
        <div className="flex items-center justify-center gap-16 text-[30px] text-[#304268]">
          <span>Home</span>
          <span>Chats</span>
          <button className="grid h-14 w-14 place-items-center rounded-full border-[6px] border-white bg-[#1e61cb] text-4xl leading-none text-white shadow-md">
            +
          </button>
          <span>My Rentals</span>
          <span>Profile</span>
        </div>
      </footer>
    </div>
  );
}
