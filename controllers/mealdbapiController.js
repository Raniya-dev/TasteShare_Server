import axios from "axios";
import recipeModel from "../models/recipeModel.js";
import mongoose from "mongoose";




export const storeMeals = async (req, res) => {
  try {
    let allMeals = [];

    // fetch A-Z recipes
    const letters = "abcdefghijklmnopqrstuvwxyz";

    for (const letter of letters) {
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
        );

        const meals = response.data.meals || [];
        allMeals = allMeals.concat(meals);
      } catch (err) {
        console.log(`Error fetching letter ${letter}`, err.message);
      }
    }

    let inserted = 0;

    for (const meal of allMeals) {
      const exists = await recipeModel.findOne({
        mealdbId: meal.idMeal,
      });

      if (exists) {
  exists.description = `Treat yourself to this delightful ${meal.strCategory.toLowerCase()} recipe. A simple, flavourful dish made to enjoy anytime.`;
   exists.youtubeLink = meal.strYoutube || "";

  await exists.save();
  continue;
}

      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim()) {
          const parts = measure ? measure.trim().split(" ") : [];

          ingredients.push({
            name: ingredient,
            quantity: parts[0] || "",
            unit: parts.slice(1).join(" ") || "",
          });
        }
      }

      const instructions = meal.strInstructions
        ? meal.strInstructions.split(/\r\n|\n/).filter(Boolean)
        : [];

      const newRecipe = new recipeModel({
        mealId: meal.idMeal,
        title: meal.strMeal,
        description: ` Treat yourself to this delightful ${meal.strCategory.toLowerCase()} recipe.A simple,flovourful dish made to enjoy anytime. `,
        ingredients,
        instructions,
        image: meal.strMealThumb,
        cookingTime: Math.floor(Math.random() * 60) + 10,
        cuisine: meal.strArea,
        category: meal.strCategory,
        dietType: meal.strTags?.toLowerCase().includes("vegetarian")
          ? "Veg"
          : "Non-veg",
        difficulty: "Medium",
        source: "mealdb",
        youtubeLink: meal.strYoutube,
      });

      await newRecipe.save();
      inserted++;
    }

    console.log("Total fetched meals:",allMeals.length);
    console.log("inserted:", inserted);

    res.status(200).json({
      message: "Meals stored successfully",
      totalFetched: allMeals.length,
      inserted,
    });
  } catch (error) {
    console.error("Error storing meals:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;

    const recipe = await recipeModel.findById(id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      recipe,
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};




export const searchRecipes = async (req, res) => {
  try {
    const {
      type,
      value,
      page = 1,
      limit = 6,
      maxTime,
      sort = "createdAt",
    } = req.query;

    let filter = {};

    if (type === "category") {
      filter.category = value;
    }

    if (type === "area") {
      filter.cuisine = value;
    }

    if (maxTime) {
  filter.cookingTime = {
    $lte: Number(maxTime)
  };
}

    const totalRecipes = await recipeModel.countDocuments(filter);

    const recipes = await recipeModel
      .find(filter)
      .sort({ [sort]: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      recipes,
      totalRecipes,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecipes / Number(limit)),
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const getAllRecipes = async (req, res) => {
  try {

    const recipes = await recipeModel.find();

    res.status(200).json({
      success: true,
      recipes
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};