$(document).ready(function() {

    var moveForce = 30; // max popup movement in pixels
    var rotateForce = 20; // max popup rotation in deg

    $(document).mousemove(function(e) {
        var docX = $(document).width();
        var docY = $(document).height();

        var moveX = (e.pageX - docX / 2) / (docX / 2) * -moveForce;
        var moveY = (e.pageY - docY / 2) / (docY / 2) * -moveForce;

        var rotateY = (e.pageX / docX * rotateForce * 2) - rotateForce;
        var rotateX = -((e.pageY / docY * rotateForce * 2) - rotateForce);

        $('.popup')
            .css('left', moveX + 'px')
            .css('top', moveY + 'px')
            .css('transform', 'rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)');
    });

    // Initialize Firebase -- this is a link to Eric's scratch Database
    var config = {
        apiKey: "AIzaSyDTbzUdtRlYpfkOZNwwWHXOg0iRmVgrEL4",
        authDomain: "who-is-scratch.firebaseapp.com",
        databaseURL: "https://who-is-scratch.firebaseio.com",
        projectId: "who-is-scratch",
        storageBucket: "who-is-scratch.appspot.com",
        messagingSenderId: "1079782059107"
    };

    firebase.initializeApp(config);

    // Get a reference to the database service
    var database = firebase.database();


    //This sextion grabs all of the unput from the input page.  Note that in our production version, 
    //only the NAME will come from the input page, the rest of the content will come from Watson

    $("#submit").on("click", function(event) {
        event.preventDefault();

        var inputName = $("#user_name").val();
        var duplicateName = 0;
        var nameArray = [];

        //these items will come from Watson, but for now, they are grabed from the input page    
        var inputOpen = $("#openness").val();
        var inputCons = $("#conscientiousness").val();
        var inputExt = $("#extraversion").val();
        var inputAgree = $("#agreeableness").val();
        var inputEmot = $("#emotional_range").val();


        //get a snapshot of the database and create an Array with all of the names currently stored
        database.ref().on("child_added", function(childSnapshot) {
            var name = childSnapshot.val().Name;
            nameArray.push(name);
            console.log(nameArray);
        });

        duplicateName = nameArray.indexOf(inputName);
        console.log("duplicateName: " + duplicateName);

        if (duplicateName != "-1") {
            alert(inputName + " is already in the Database");
        } else {

            //<----------------------------------------------------------------------
            //
            //      This is where we make our call to Watson.  
            //      The values returned will be assigned to the "inputXYZ" variables.
            //
            //
            //<----------------------------------------------------------------------

            //Push the name and returned numbers into the database
            database.ref().push({
                Name: inputName,
                Openness: inputOpen,
                Conscientiousness: inputCons,
                Extraversion: inputExt,
                Agreeableness: inputAgree,
                Emotional_Range: inputEmot
            });
        }

    });

    //whenever the database changes, pull the database contents and update the chart
    database.ref().on("child_added", function(childSnapshot) {
        var key = childSnapshot.key;
        var name = childSnapshot.val().Name;
        var openness = childSnapshot.val().Openness;
        var conscientiousness = childSnapshot.val().Conscientiousness;
        var extraversion = childSnapshot.val().Extraversion;
        var agreeableness = childSnapshot.val().Agreeableness;
        var emotional_range = childSnapshot.val().Emotional_Range;


        // build table
        var row = $("<tr>");
        var cell_1 = $("<td>");
        var cell_2 = $("<td>");
        var cell_3 = $("<td>");
        var cell_4 = $("<td>");
        var cell_5 = $("<td>");
        var cell_6 = $("<td>");
        var cell_7 = $("<td>");

        var delete_button = $("<button>");

        row.attr("id", "row" + key);
        delete_button.attr("id", key);
        delete_button.addClass("btn btn_rmv btn-danger");
        delete_button.text("Delete");

        cell_1.append(delete_button);

        // ToDo: I need to append an href to Cell2 so that we can link to it's chart....
        cell_2.append(name);

        cell_3.append(openness);
        cell_4.append(conscientiousness);
        cell_5.append(extraversion);
        cell_6.append(agreeableness);
        cell_7.append(emotional_range);

        row.append(cell_1);
        row.append(cell_2);
        row.append(cell_3);
        row.append(cell_4);
        row.append(cell_5);
        row.append(cell_6);
        row.append(cell_7);

        $("tbody").append(row);

    });

    $(document).on("click", ".btn", function(event) {
        event.preventDefault();
        var button_index = $(this).attr("id");
        $("#row" + button_index).remove();
        database.ref(button_index + "/").remove();
    });


    // This event handler changes the mouse type to a clickable hand when over a name
    $(document).on("mouseover", "#header tr:has(td)", function(e) {
        $(this).css("cursor", "pointer");
    });


    // This event handler highlights the name when clicked and also renders the chart
    $(document).on("click", "#header tr:has(td)", function(e) {
        $("#header td").removeClass("highlight");
        var clickedCell = $(e.target).closest("td");
        clickedCell.addClass("highlight");
        $('#' + clickedCell.parent().attr('id')).each(function(index, tr) {
            var rowData = $('td', tr).map(function(index, td) {
                return $(td).text();
            });
            var chartData = [parseFloat(rowData[2]), parseFloat(rowData[3]), parseFloat(rowData[4]), parseFloat(rowData[5]), parseFloat(rowData[6])];
            console.log(chartData);
            renderChart(chartData);
        });

    });

});

function renderChart(chartData) {
    var ctx = document.getElementById('myChart').getContext('2d');

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Emotional Range"],
            datasets: [{
                label: "Personality Chart",
                backgroundColor: ["blue", "orange", "teal", "red", "purple"],
                data: chartData
            }]
        },
        // Configuration options go here
        options: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Personality Data'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
};