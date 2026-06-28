const menus = {
  rice: {
    title: "Rice-Based",
    image: "assets/menu-rice.jpeg",
    alt: "Rice-based menu board",
    items: [
      ["Basmati jollof and chicken", "N3,500"],
      ["Chinese fried rice and chicken", "N5,000"],
      ["Fried rice and chicken", "N3,500"],
      ["Native rice / fish / egg", "N2,500"],
      ["Chicken rice cake (Masa)", "N350"],
      ["Ofada rice / beans with Ofada sauce", "N2,500"],
      ["Basmati white rice, sides, veggies, tomatoes chicken stew", "N3,500"],
      ["Basmati white rice, beef curry sauce", "N3,300"],
      ["Basmati white rice, gizzard sauce", "N4,000"]
    ]
  },
  special: {
    title: "Special Meals",
    image: "assets/menu-special.jpeg",
    alt: "Special meals menu board",
    items: [
      ["Creamy pasta", "N5,000"],
      ["Loaded stir fried pasta", "N3,000"],
      ["Sea food spaghetti", "N9,000"],
      ["Stir fried spaghetti", "N3,000"],
      ["Loaded fries", "N6,000"],
      ["Irish fries, ketchup, fried egg, sausage", "N3,000"],
      ["Plantain fries assorted with chicken", "N3,500"]
    ]
  },
  spaghetti: {
    title: "Spaghetti-Based",
    image: "assets/menu-spaghetti.jpeg",
    alt: "Spaghetti-based menu board",
    items: [
      ["White spaghetti, beef curry sauce, boiled eggs, plantain", "N3,500"],
      ["White spaghetti, tomatoes chicken stew", "N3,500"],
      ["Boiled Irish potatoes with fish sauce", "N2,000"],
      ["Yamarita, egg sauce", "N2,500"]
    ]
  },
  noodles: {
    title: "Noodles",
    image: "assets/menu-noodles.jpeg",
    alt: "Noodles menu board",
    items: [
      ["Stir fried noodles, boiled eggs", "N1,500"],
      ["Loaded stir fried noodles", "N3,500"],
      ["Chinese rice sticks (choice protein)", "N3,000"],
      ["Sea food noodles", "N9,000"],
      ["Foreign egg noodles", "N5,000"]
    ]
  },
  kebabs: {
    title: "Kebabs",
    image: "assets/menu-kebabs.jpeg",
    alt: "Kebabs menu board",
    items: [
      ["Offals", "N1,000"],
      ["Chevon (goat)", "N1,000"],
      ["Beef", "N1,000"],
      ["Peppered pomo", "N1,500"]
    ]
  },
  salads: {
    title: "Salads",
    image: "assets/menu-salads.jpeg",
    alt: "Salads menu board",
    items: [
      ["Fruit salad", "Ask"],
      ["Vegetable salads", "Ask"],
      ["Chicken salad", "Ask"]
    ]
  },
  sides: {
    title: "Sides",
    image: "assets/menu-sides.jpeg",
    alt: "Sides menu board",
    items: [
      ["Sausage (2)", "N300"],
      ["Plantain (5)", "N500"],
      ["Egg curds five pieces / two pieces", "N1,000 / N500"],
      ["Boiled eggs", "N250"],
      ["Stir fried shrimps", "N1,000"],
      ["Fish", "N1,000"],
      ["Beef", "N300"],
      ["Chicken", "Big N3,500 · Medium N2,500 · Small N2,000"]
    ]
  },
  sips: {
    title: "Sips",
    image: "assets/menu-sips.jpeg",
    alt: "Sips menu board",
    items: [
      ["Cocktail", "N2,000 / N1,200"],
      ["Mocktail", "N2,000 / N1,200"],
      ["Chapman", "N2,000 / N1,200"],
      ["Pure fruit juice", "N1,000"],
      ["Fruit infused water", "N1,500"],
      ["Smoothies", "N2,000 / N3,000"],
      ["Vegetable juices", "N1,500 / N2,000"],
      ["Dietary needs juices", "Ask"]
    ]
  }
};

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const tabs = document.querySelectorAll(".tab");
const menuTitle = document.querySelector("#menuTitle");
const menuImage = document.querySelector("#menuImage");
const menuItems = document.querySelector("#menuItems");
const orderForm = document.querySelector("#orderForm");
const formStatus = document.querySelector("#formStatus");

function renderMenu(key) {
  const menu = menus[key];
  menuTitle.textContent = menu.title;
  menuImage.src = menu.image;
  menuImage.alt = menu.alt;
  menuItems.innerHTML = menu.items
    .map(([name, price]) => `
      <div class="menu-item">
        <strong>${name}</strong>
        <span>${price}</span>
      </div>
    `)
    .join("");
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    renderMenu(tab.dataset.menu);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

orderForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(orderForm);
  const payload = Object.fromEntries(formData.entries());
  formStatus.textContent = "Sending your order request...";

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Email endpoint unavailable");
    }

    orderForm.reset();
    formStatus.textContent = "Order request sent. Eats N Sips will receive an email notification.";
  } catch (error) {
    const subject = encodeURIComponent(`Eats N Sips order from ${payload.name}`);
    const body = encodeURIComponent(
      `Name: ${payload.name}\nEmail: ${payload.email}\nPhone: ${payload.phone}\n\nOrder details:\n${payload.message}`
    );
    window.location.href = `mailto:eatsnsipsafrica@gmail.com?subject=${subject}&body=${body}`;
    formStatus.textContent = "Your email app has been opened with the order details ready to send.";
  }
});

renderMenu("rice");
