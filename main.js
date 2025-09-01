import { html } from "lit-html";
import { component, useState, useEffect } from "@pionjs/pion";

const API_URL = "https://www.thecocktaildb.com/api/json/v1/1/search.php?s=";
const TEXTS_PLACEHOLDERS = {
  LOADING: "Searching...",
  SEARCH_PLACEHOLDER: "Search for a cocktail...",
  NO_RESULTS: "No results found",
  SEARCH: "Search",
  COCKTAILS_TITLE: "🍹 Cocktail Assistant",
  INGREDIENTS: "Ingredients",
  ADD_TO_CART: "Add to Cart",
  SHOPPING_LIST: "Shopping List",
  PRINT: "Print ingredients",
  INGREDIENTS_ADDED_TO_SHOPPING_LIST: "Ingredients added to shopping list",
  HERE_ARE_THE_RESULTS: "Here are the results",
  FAILED_TO_FETCH: "Failed to fetch cocktails",
};

function CocktailAssistant() {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [toaster, setToaster] = useState(false);
  const [cocktails, setCocktails] = useState([]);
  const [ingredientsCart, setIngredientsCart] = useState([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [toasterText, setToasterText] = useState("");
  const [search, setSearch] = useState(false);

  const printShoppingList = () => {
    setDialogVisible(!dialogVisible);
  };

  const removeIngredientFromCart = (ingredient) => {
    setIngredientsCart((prevCart) =>
      prevCart.filter((item) => item !== ingredient)
    );
  };

  const addIngredientsToCart = (cocktail) => {
    setToasterText(TEXTS_PLACEHOLDERS.INGREDIENTS_ADDED_TO_SHOPPING_LIST);
    setToaster(true);

    let cockTailIngredients =
      Object.entries(cocktail)
        .filter((q) => q[0].includes("strIngredient") && q[1])
        .map((q) => q[1]) || [];
    cockTailIngredients = [...new Set(cockTailIngredients)];

    setIngredientsCart((prevCart) => [
      ...new Set([...prevCart, ...cockTailIngredients]),
    ]);
  };

  const fetchAllCocktails = async () => {
    setSearch(false);
    if (!query) {
      setSearch(false);
      setCocktails([]);
      return;
    }

    try {
      setToasterText(TEXTS_PLACEHOLDERS.LOADING);
      setToaster(true);
      setSearch(false);

      const response = await fetch(API_URL + query);
      const data = await response.json();
      if (data) {
        setSearch(true);
        if (Array.isArray(data.drinks) && data.drinks.length > 0) {
          setToasterText(TEXTS_PLACEHOLDERS.HERE_ARE_THE_RESULTS);
          setCocktails(data?.drinks || []);
          return;
        } else {
          setCocktails([]);
        }
        setToaster(true);
        setToasterText(TEXTS_PLACEHOLDERS.NO_RESULTS);
      }
    } catch (err) {
      console.error(err);
      setToaster(false);
      setSearch(false);
      setError(TEXTS_PLACEHOLDERS.FAILED_TO_FETCH);
    }
  };

  useEffect(() => {
    if (ingredientsCart.length <= 0) {
      setToaster(false);
    }
  }, [ingredientsCart]);

  useEffect(() => {
    if (!query) {
      setSearch(false);
      setCocktails([]);
      setIngredientsCart([]);
      setToaster(false);
      setDialogVisible(false);
    }
  }, [query]);

  return html`
    <style>
      .container {
        font-family: sans-serif;
        padding: 1rem;
        max-width: 80%;
        margin: auto;
      }
      .search {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
        justify-content: space-between;
      }
      .search input {
        display: inline-block;
        border: solid 1px #ddd;
        padding: 10px;
        border-radius: 5px;
        font-size: 16px;
        flex: 1;
      }
      .search button {
        cursor: pointer;
        padding: 10px;
        border-radius: 5px;
        border: none 0;
        font-size: 16px;
        color: white;
        background: blue;
      }

      .results-container {
        display: flex;
        gap: 10px;
        justify-content: space-between;
      }

      .results-container .shopping-list {
        width: 20%;
        border: solid 1px #ccc;
        padding: 5px 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        background: #f9f9f9;
      }

      .results-container .shopping-list ul {
        padding: 0;
        list-style: none;
      }

      .results-container .shopping-list .cart-item {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
      }

      .results-container .shopping-list button {
        cursor: pointer;
        border: none 0;
        background: black;
        color: white;
        border-radius: 5px;
        padding: 5px;
      }

      .cocktails {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(33%, 1fr));
        gap: 1rem;
        flex: 1;
      }

      .cocktails .card {
        border: 1px solid #ccc;
        padding: 1rem;
        background: #f9f9f9;
        border-radius: 5px;
      }

      .cocktails .card .media {
        display: flex;
        gap: 10px;
      }

      .cocktails .card .media img {
        max-width: 100%;
      }

      .cocktails .card .footer {
        text-align: right;
      }

      .cocktails .card .footer .add-to-cart {
        padding: 10px;
        border: none 0px;
        background: blue;
        color: white;
        border-radius: 5px;
        cursor: pointer;
      }

      .toaster {
        position: fixed;
        bottom: 10px;
        right: 10px;
        border: solid 1px #000;
        padding: 10px 20px;
      }
    </style>

    <div class="container">
      ${toaster ? html`<div class="toaster">${toasterText}</div>` : ""}
      <h2>${TEXTS_PLACEHOLDERS.COCKTAILS_TITLE}</h2>
      <div class="search">
        <input
          type="text"
          id="search"
          placeholder="${TEXTS_PLACEHOLDERS.SEARCH_PLACEHOLDER}"
          @input=${(e) => setQuery(e.target.value)}
        />
        <button @click=${() => fetchAllCocktails()}>
          ${TEXTS_PLACEHOLDERS.SEARCH}
        </button>
      </div>
      ${search && cocktails.length === 0
        ? html`<div class="no-results">${TEXTS_PLACEHOLDERS.NO_RESULTS}</div>`
        : html`<div class="results-container">
            <div class="cocktails">
              ${cocktails.map(
                (drink) => html`
                  <div class="card">
                    <div class="media">
                      <div class="img-container">
                        <img src="${drink.strDrinkThumb}" width="100" />
                      </div>
                      <div class="description">
                        <h3 style="margin-top:0;">${drink.strDrink}</h3>
                        <p>
                          <strong>${TEXTS_PLACEHOLDERS.INGREDIENTS}:</strong>
                        </p>
                        <ul>
                          ${[...Array(15)].map((_, i) => {
                            const ing = drink[`strIngredient${i + 1}`];
                            return ing ? html`<li>${ing}</li>` : "";
                          })}
                        </ul>
                      </div>
                    </div>
                    <div class="footer">
                      <button
                        class="add-to-cart"
                        @click=${() => addIngredientsToCart(drink)}
                      >
                        ${TEXTS_PLACEHOLDERS.ADD_TO_CART}
                      </button>
                    </div>
                  </div>
                `
              )}
            </div>
            ${dialogVisible
              ? html`<dialog open=${dialogVisible}>
                <button autofocus @click=${() =>
                  setDialogVisible(false)}>Close</button>
                <p>
                  <ul>
                        ${ingredientsCart.map(
                          (item) =>
                            html`<li class="cart-item">
                              <span>${item}</span>
                            </li>`
                        )}
                      </ul>
                </p>
              </dialog>`
              : null}
            ${ingredientsCart.length > 0
              ? html`<div class="shopping-list">
                  <h3>${TEXTS_PLACEHOLDERS.SHOPPING_LIST}</h3>
                  <div class="cart">
                    <ul>
                      ${ingredientsCart.map(
                        (item) =>
                          html`<li class="cart-item">
                            <span>${item}</span>
                            <button
                              @click=${() => removeIngredientFromCart(item)}
                            >
                              X
                            </button>
                          </li>`
                      )}
                    </ul>
                  </div>
                  <div class="print">
                    <button @click=${printShoppingList}>
                      ${TEXTS_PLACEHOLDERS.PRINT}
                    </button>
                  </div>
                </div>`
              : ""}
          </div>`}
      ${error && html`<div class="error">${error}</div>`}
    </div>
  `;
}

customElements.define("cocktail-assistant", component(CocktailAssistant));
