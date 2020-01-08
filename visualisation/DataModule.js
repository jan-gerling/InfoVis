var data_path = "../data/clubs_transfers";
var transfer_data;
var counter = 0;
// var transfer_data = load_data(2000, 2002);

// Helper function to sleep a thread
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Load all the available json data
// Calls a callback when finished
async function load_data(start_year, end_year, _callback){
    var data = {};
    for (let year = start_year; year <= end_year; year++) {
        await jQuery.getJSON(data_path.concat(year).concat(".json"), function(json) {
            data[year] = json;
            counter++;
        });
    }
    transfer_data = data;
    while (counter < end_year - start_year) {
        // Sleep to make the loop less intensive
        await sleep(500);
    }
    console.log("Data loaded")
    _callback();
}

// Get all data for a specific club
// Used data variable to pass the data for specific years if desired
function get_club(club, data){
    var dat = data !== undefined ? data : transfer_data;
    var filtered_data = {};
    for(var year in dat){
        var yearTransfers = transfer_data[parseInt(year)];
        for (var cl in yearTransfers) {
            var c = Object.values(yearTransfers[cl])[0];
            if (c.href.split("/")[4] === club.split("/")[4]) {
                filtered_data[parseInt(year)] = c;
            }
        }
    }
    return filtered_data;
}

// Get the data for a specific range of seasons
function get_years(start_year, end_year) {
    var data = {};
    for (let year = start_year; year <= end_year; year++) {
        data[year] = transfer_data[year];
    }
    return data;
}