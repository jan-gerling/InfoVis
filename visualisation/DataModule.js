var data_path = "/data/transfers_club_leagues";
var transfer_data = load_data(2000, 2002);


function load_data(start_year, end_year){
    var data = {};
    for (let year = start_year; year < end_year; year++) {
        jQuery.getJSON(data_path.concat(year).concat(".json"), function(json) {
            data[year] = json;
            console.log(data[year]);
        });
    }
    return data
}

function get_club(club){
    var filtered_data = {};
    for(const year in transfer_data){
        filtered_data[year] = transfer_data[club];
        console.log(filtered_data[year]);
    }
    
    return filtered_data
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
        console.log(filtered_data[year]);
    }
    
    return filtered_data
}