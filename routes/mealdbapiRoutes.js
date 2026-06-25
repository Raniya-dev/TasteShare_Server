import express from 'express'

import {storeMeals, getRecipeById,searchRecipes,getAllRecipes} from '../controllers/mealdbapiController.js'

const mealdbapiRouter = express.Router();

mealdbapiRouter.post('/storemeals',storeMeals)
mealdbapiRouter.get('/recipe/search',searchRecipes)
mealdbapiRouter.get('/recipes/allrecipes',getAllRecipes)
mealdbapiRouter.get('/recipe/:id',getRecipeById)

export default mealdbapiRouter