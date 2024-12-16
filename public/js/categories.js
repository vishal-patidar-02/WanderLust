document.addEventListener("DOMContentLoaded", () => {
    const categoryOptions = document.querySelectorAll(".category-option");
    const categoriesInput = document.getElementById("categories");

    let selectedCategories = [];

    categoryOptions.forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        const category = event.target.textContent;

        if (!selectedCategories.includes(category)) {
          selectedCategories.push(category);
        } else {
          selectedCategories = selectedCategories.filter(
            (cat) => cat !== category
          );
        }

        // Update the input value
        categoriesInput.value = selectedCategories.join(", ");
      });
    });
  });