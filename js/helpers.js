/***************************
    Data Query Helpers
***************************/

// loads daily data from our API
function loadDailyData(dailyData, callback) {
    // load the data
    var getData = new Promise(resolve => {
        $.getJSON("https://viand-api.herokuapp.com/api/today", function(data) {
            resolve(data);
        });
    });

    // what to do after we get the data
    getData.then(data => {

        // display the possible meal options: usually BLD
        // displayMealOptions('select_meal', data);

        // set the daily data equal to data we get
        dailyData = data;

        // call some callback to visualize teh data
        callback(data);
    });
}

// gets the data for an individual food item based on name
async function getFoodData(foodName) {
    if (foodName.includes('&amp;')) {
        foodName = foodName.replace('&amp;', '&');
    }
    if (foodName.includes('/')) {
        foodName = foodName.replace('/', '%2f')
    }

    return new Promise(resolve => {
        $.getJSON("https://viand-api.herokuapp.com/api/food/" + foodName, function(data) {
            resolve(data);
        });
    });
}



/**************************************************
        Display the data
**************************************************/

// displays the data initially when logging in
function initialDisplay(data) {
    var mealTimeQuery = decideMealTime();
    document.getElementById('headline-title').innerHTML += " "+ mealTimeQuery; 
    var mealTime = processMealData(data, mealTimeQuery);
    displayCategories(mealTime, 'food-contain');
}


/********************
    Data processing
**********************/
// process the data further given a meal time
function processMealData(dailyData, mealTimeQuery) {
    var mealsTimes = dailyData.meals_times;
    for (mealTime of mealsTimes) {
        if (mealTime.meal_time == mealTimeQuery) {
            return mealTime;
        }
    }
}

// TODO;
// decides which meal to display based on time of day
// currently always returns lunch
function decideMealTime() {
    return 'Lunch';
}

/***************************************************
        Helpers for display process
****************************************************/

// List all the categories that are available for the meal
function displayCategories(mealData, category_list_id) {
    categories = mealData.meal_data;
    for (category of categories) {

        // give each category a unique id
        var id = 'category' + categories.indexOf(category);
        document.getElementById(category_list_id).innerHTML += '<h3 class="mt-5">' +
            category.category + '</h3><hr><div class="row" id="' + id + '"></div>';

        // fill categories  with food information
        displayCategoryItems(category.foods, id);
    }
}

// display the current menu items given a category
function displayCategoryItems(data, category_id) {
    for (foodItem of data) {

        getFoodData(foodItem).then(result => {
            if (result.food_info) {
                var foodId = category_id + '-food' + data.indexOf(result.food_name);
                document.getElementById(category_id).innerHTML += cardify(result, foodId);
                var barchart = new BarChart(foodId + '-barchart', result);
            }
        });
    }
}

// display food items in a card
function cardify(food, food_id) {

    // create a card for each food item
    var htmlString = '<div class="col-md-4 mt-2 mb-2" id ="' + food_id + '"">\
        <div class="card">\
        <div class="card-body">\
        <h5 class="card-title">' + food.food_name + '</h5>\
        <h6 class="card-subtitle mb-2 text-muted">Serving Size: ' + food.food_info.serving_size + '</h6>\
        <h6 class="card-subtitle mb-2 text-muted">Calories: ' + food.food_info.calories + '</h6>\
        <div class="barchart" id="' + food_id + '-barchart"></div>\
        </div>\
        </div>\
        </div>';


return htmlString;
}
