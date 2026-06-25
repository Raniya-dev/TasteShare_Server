import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import {
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
} from '../controllers/recipeController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import upload from "../middlewares/multer.js";

const recipeRouter = express.Router();

recipeRouter.get('/', authMiddleware(), getRecipes);
recipeRouter.get('/searchbyrecipe', searchRecipes);


recipeRouter.post(
  "/create",
  authMiddleware(),
  upload.single("image"),
  (req, res, next) => {
    console.log("MULTER WORKING");
    console.log(req.body);
    console.log(req.file);
    next();
  },
  createRecipe
);

recipeRouter.get(
  "/my-recipes",
  authMiddleware(),
  getMyRecipes
);

recipeRouter.put(
  "/update/:id",
  authMiddleware(),
  upload.single("image"),
  updateRecipe
);

recipeRouter.delete(
  "/delete/:id",
  authMiddleware(),
  deleteRecipe
);

recipeRouter.get('/getfavorite', authMiddleware(), getFavoriteRecipe);
recipeRouter.get('/:id', authMiddleware(), getRecipeById);
recipeRouter.post('/favorite',authMiddleware(), favoriteRecipe);

recipeRouter.delete('/favorite/:recipeId', authMiddleware(), removeFavorite);

export default recipeRouter;
