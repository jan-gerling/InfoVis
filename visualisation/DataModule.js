var data_path = "/data/clubs_transfers";
var transfer_data;
var counter = 0;
// var transfer_data = load_data(2000, 2002);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function load_data(start_year, end_year, _callback){
    var data = {};
    for (let year = start_year; year < end_year; year++) {
        await jQuery.getJSON(data_path.concat(year).concat(".json"), function(json) {
            data[year] = json;
            counter++;
        });
    }
    transfer_data = data;
    while (counter < end_year - start_year) {
        await sleep(500);
    }
    console.log("Data loaded")
    _callback();
}

function get_club(club){
    var filtered_data = {};
    for(var year in transfer_data){
        var yearTransfers = transfer_data[parseInt(year)];
        for (var cl in yearTransfers) {
            var t = yearTransfers[cl];
            if (t[club] !== undefined) {
                filtered_data[parseInt(year)] = t[club];
            }
        }
    }

    return filtered_data;
}

function get_league(league){
    filtered_data = {};
    for(const year in transfer_data){
        var clubs = {};
        for (const club in transfer_data[year]){
            var club_data = transfer_data[year][club];
            if (club_data[club_league] === league){
                clubs[club] = club_data;
            }
        }
        filtered_data[year] = clubs;
    }

    return filtered_data
}