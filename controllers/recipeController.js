import recipeModel from '../models/recipeModel.js';

import Favorite from '../models/favoriteModel.js';




const createRecipe = async (req, res) => {
  try {
    

    const ingredients = JSON.parse(req.body.ingredients);
    const instructions = JSON.parse(req.body.instructions);

    

   

    const recipe = await recipeModel.create({
      title: req.body.title,
      description: req.body.description,
      ingredients,
      instructions,
      cookingTime: Number(req.body.cookingTime),
      cuisine: req.body.cuisine,
      dietType: req.body.dietType,
      difficulty: req.body.difficulty,
      category: req.body.category,
      image: req.file?.path,
      createdBy: req.user.id,
    });

    res.status(201).json(recipe);

  } catch (error) {
    console.error("CREATE RECIPE ERROR:");
    console.error(error);
    console.error(error.stack);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyRecipes = async (req, res) => {
  try {
    const recipes = await recipeModel.find({
      createdBy: req.user.id,
    });

    res.json(recipes);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getRecipes = async (req, res) => {
  try {
    const { mine,
      category,
      cuisine

    } = req.query;
    const query = {};

    if (mine === 'true' && req.user?.id) {
      query.createdBy = req.user.id;
    }

    if (category) {
      query.category = category;
    }

    if (cuisine) {
      query.cuisine = cuisine;
    }


    const recipes = await recipeModel.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ recipes });
  } catch (error) {
    console.error('Get recipes error:', error);
    return res.status(500).json({ message: 'Server error fetching recipes.' });
  }
};

const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const recipe = await recipeModel.findById(id);

    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found.' });
    }

    return res.status(200).json({ recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    return res.status(500).json({ message: 'Server error fetching recipe.' });
  }
};

const updateRecipe = async (req, res) => {
  try {
    const recipe = await recipeModel.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    
    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

   
    const updateData = { ...req.body };


    if (typeof req.body.ingredients === 'string') {
      try {
        updateData.ingredients = JSON.parse(req.body.ingredients);
      } catch (e) {
        return res.status(400).json({ message: "Invalid ingredients data format." });
      }
    }

    if (typeof req.body.instructions === 'string') {
      try {
        updateData.instructions = JSON.parse(req.body.instructions);
      } catch (e) {
        return res.status(400).json({ message: "Invalid instructions data format." });
      }
    }

    
    if (req.file) {
      updateData.image = req.file.path;
    }

    const updatedRecipe = await recipeModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } 
    );

    res.json(updatedRecipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteRecipe = async (req, res) => {
  try {
    const recipe = await recipeModel.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        message: "Recipe not found",
      });
    }

    if (recipe.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await recipe.deleteOne();

    res.json({
      message: "Recipe deleted",
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const searchRecipes = async (req, res) => {
  try {
    const { q, page = 1, limit = 6 } = req.query;

    let query = {};

    if (q) {
      const terms = q
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);

      query.$or = [
        
        {
          title: {
            $regex: q,
            $options: "i"
          }
        },

        
        {
          $and: terms.map(term => ({
            "ingredients.name": {
              $regex: term,
              $options: "i"
            }
          }))
        }
      ];
    }


    const totalRecipes = await recipeModel.countDocuments(query)


    const recipes = await recipeModel
      .find(query)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      recipes,
      totalRecipes,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecipes / Number(limit))
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
const favoriteRecipe = async (req, res) => {
  try {
    const { recipeId } = req.body;
    const userId = req.user.id;

    const existing = await Favorite.findOne({
      userId,
      recipeId
    });

   
    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);

      return res.status(200).json({
        liked: false,
        message: "Removed from favorites"
      });
    }

    
    const favorite = await Favorite.create({
      userId,
      recipeId
    });

    res.status(200).json({
      liked: true,
      favorite,
      message: "Added to favorites"
    });

  } catch (error) {
    console.error("Favorite recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};

const getFavoriteRecipe = async (req, res) => {

  try {
    const userId = req.user.id;

    const favorites = await Favorite.find({
      userId,
    }).populate("recipeId");

    res.status(200).json(favorites);

  } catch (error) {
    console.error("Get favorite recipe error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};
const removeFavorite = async (req, res) => {
  try {
    const { recipeId } = req.params;

    await Favorite.findOneAndDelete({
      userId: req.user.id,
      recipeId,
    });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  createRecipe,
  getMyRecipes,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  searchRecipes,
  favoriteRecipe,
  getFavoriteRecipe,
  removeFavorite

};
