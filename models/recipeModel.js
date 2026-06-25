import mongoose from "mongoose";


const ingredientSchema = new mongoose.Schema({


    name: {
        type: String,
        required: true
    },

    quantity: {
        type: String,
        default: ""
    },

    unit: {
        type: String,
        default: ""
    }

}, { _id: false });





const recipeSchema = new mongoose.Schema({
    mealId: {
    type: String,
    unique: true,
    sparse: true,
    default: undefined

    },
    category:{
        type:String
    },
     title: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    ingredients: [ingredientSchema],

    instructions: [{
        type: String,
        required: true
    }],

    image: {
        type: String
    },

    cookingTime:Number,

    cuisine: {
        type: String
    },

    dietType: {
        type: String
       
       
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard']
    },

    averageRating: {
        type: Number,
        default: 0
    },
    youtubeLink:{
        type:String
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
   
    source: {
   type: String,
   enum: ["mealdb", "user"],
   default: "user"
}

}, { timestamps: true })

export default mongoose.model('Recipe', recipeSchema)