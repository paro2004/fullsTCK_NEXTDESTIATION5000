const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    comment : String,
    rating : {
        type :  Number,
        min : 1,
        max : 5,
    },
    createdAt : {
        type : Date,
        default : Date.now()
    },
    
    author : {
        type:Schema.Types.ObjectId,
        ref: "User",
    }

});

module.exports = mongoose.model("Review", reviewSchema);

// ei khane amader je ei reviews schema ta amra toiri korlam seta abar amader listing sathe connected ...ar sei relationship tao amader "1:n" mane amader "1 : many" relationship.