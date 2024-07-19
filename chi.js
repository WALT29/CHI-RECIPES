const search = document.getElementById("search");
const recipe_container = document.getElementById("recipeResultsElements");
const pop_up_container = document.getElementById("pop-up-container");
const recipe_name = document.getElementById("recipe-name");
const saved_recipes = document.getElementById("recipes-container");
const popular_ingredient=document.querySelectorAll(".popular-ingredient");

let recipeData = [];

// This is my Recipe search form event listener
search.addEventListener("submit", (event) => {
    event.preventDefault();
    let search_input = document.getElementById("searchinput").value.trim();
    search_function(search_input);
    scrollToContainer(recipe_container)
});

function search_function(search_item){
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search_item}`)
        .then(response => response.json())
        .then(data => {
            recipe_generator(data);
        });
}



// I have added DOMContentLoaded event listener ,so tht every time a the page loads ,I reinitialize what is in the local storage and I perform  a random search for the latest recipes

document.addEventListener("DOMContentLoaded", () => {

    // Initialize saved recipes from localStorage
    recipeData = JSON.parse(localStorage.getItem('recipeData')) || [];
    create_items();

    let search_input = document.getElementById("searchinput").value.trim();
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search_input}`)
        .then(response => response.json())
        .then(data => {
            recipe_generator(data);
        });
});


//this functions generates recipe into the DOM when I pass in the data from THE MEAL DATABASE API
let recipe_generator = (data) => {
    recipe_container.innerHTML = "";

    if (data.meals) {
        data.meals.forEach((element) => {
            recipe_container.innerHTML += `
                <div class="recipeResult">
                    <img src="${element.strMealThumb}" alt="">
                    <div class="recipeDetails">
                        <h2 class="recipeName">${element.strMeal}</h2>
                        <div class="buttons">
                            <button id="getButton" type="submit" data-id="${element.idMeal}">GET RECIPE</button>
                            <button id="save" type="submit" data-id="${element.idMeal}">SAVE</button>
                        </div>
                    </div>
                </div>  
            `;
        });

        const buttons = recipe_container.querySelectorAll('#getButton');
        const likes = recipe_container.querySelectorAll('#save');

        buttons.forEach((button) => {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                let data_id = event.target.attributes["data-id"].nodeValue;
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data_id}`)
                    .then(response => response.json())
                    .then((data) => {
                        trigger_pop_up(data.meals[0]);
                    });
            });
        });

        likes.forEach((like) => {
            like.addEventListener("click", (event) => {
                event.preventDefault();
                let data_id = event.target.attributes["data-id"].nodeValue;
                fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data_id}`)
                    .then(response => response.json())
                    .then((data) => {
                        save_recipe(data.meals[0]);
                    });
            });
        });
    } else {
        recipe_container.innerHTML = '<p class="recipe-not-found">No recipes found. Please try a different search.</p>';
    }
}


//TO achieve a one page layout I have used a pop up to display recipe ingredients 
function trigger_pop_up(data) {
    let ingredients_unfiltered = [
        data.strIngredient1, data.strIngredient2, data.strIngredient3, data.strIngredient4,
        data.strIngredient5, data.strIngredient6, data.strIngredient7, data.strIngredient8, data.strIngredient9,
        data.strIngredient10, data.strIngredient11, data.strIngredient12, data.strIngredient13, data.strIngredient14,
        data.strIngredient15, data.strIngredient16, data.strIngredient17, data.strIngredient18, data.strIngredient19,
        data.strIngredient20
    ];

    let ingredients_filtered = ingredients_unfiltered.filter(ingredient => {
        return ingredient !== "";
    });

    pop_up_container.style.display = "flex";
    pop_up_container.innerHTML = `
        <div id="pop-up">
            <div class="wrapper">
                <div class="close"><i class='bx bx-x'></i></div>
                <div id="popup-content">
                    <h2 id="recipe-name" class="recipeName">${data.strMeal}</h2>
                    <h3 class="ingredients-header">INGREDIENTS</h3>
                    <ol class="ingredients-container"></ol>
                    <h3 class="steps">STEPS</h3>
                    <p class="cooking_steps">${data.strInstructions}</p>
                </div>
            </div>
        </div>
    `;

    const close = document.querySelector(".close");
    const ingredients_container = document.querySelector(".ingredients-container");

    close.addEventListener("click", () => {
        pop_up_container.style.display = "none";
    });

    ingredients_filtered.forEach((ingredient) => {
        ingredients_container.innerHTML += `
            <li class="ingredient">${ingredient}</li>
        `;
    });

    pop_up_container.addEventListener("click", () => {
        pop_up_container.style.display = "none";
    });
}

popular_ingredient.forEach((ingredient)=>{
    ingredient.addEventListener("click",(event)=>{
        event.preventDefault();
        const ingredient_name=ingredient.querySelector(".recipeName").textContent;
        console.log(ingredient_name);
        search_function(ingredient_name)
        scrollToContainer(recipe_container)
    })

})

//this function saves recipes in the local storage after saving the recipe in the local storage ,I have invoked the create_items which updates the save recipes in the DOM 
function save_recipe(recipe) {
   
     if (!recipeData.some(element => element.idMeal === recipe.idMeal)) {
        recipeData.push(recipe);
        localStorage.setItem('recipeData', JSON.stringify(recipeData));
        create_items();
    } else {
        alert("This recipe is already saved.");
    }
}

//This functions displays saved recipes in the DOM
function create_items() {
    saved_recipes.innerHTML = "";
    let savedRecipes = JSON.parse(localStorage.getItem("recipeData")) || [];
    console.log(`savedRecipes: ${savedRecipes}`);

    savedRecipes.map((element) => {
        console.log(element.strMealThumb);
        saved_recipes.innerHTML += `
             <div class="saved-recipe">
                <img src="${element.strMealThumb}" alt="">
                <div class="recipeDetails">
                    <h2 class="recipeName">${element.strMeal}</h2>
                    <div class="buttons">
                        <button id="getButton" type="submit" data-id="${element.idMeal}">GET RECIPE</button>
                        <button id="deleteButton" type="submit" data-id="${element.idMeal}">DELETE</button>
                    </div>
                </div>
            </div>
        `;
    });

    const getButtons = saved_recipes.querySelectorAll('#getButton');
    const deleteButtons = saved_recipes.querySelectorAll('#deleteButton');

    getButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            let data_id = event.target.attributes["data-id"].nodeValue;
            fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${data_id}`)
                .then(response => response.json())
                .then((data) => {
                    trigger_pop_up(data.meals[0]);
                });
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            let data_id = event.target.attributes["data-id"].nodeValue;
            delete_recipe(data_id);
        });
    });
}


//This function delete a saved recipe based of an items id
function delete_recipe(id) {
    let savedRecipes = JSON.parse(localStorage.getItem("recipeData")) || [];
    savedRecipes = savedRecipes.filter(recipe => recipe.idMeal !== id);
    localStorage.setItem("recipeData", JSON.stringify(savedRecipes));
    create_items();
}

//I have created a function that scrolls the user into view when he /she ahs performed a search or click event on the popular ingredients
function scrollToContainer(section) {
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}
