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
    $("#header tr:has(td)").mouseover(function(e) {
        $(this).css("cursor", "pointer");
    });

    // This event handler highlights the name when clicked
    $("#header tr:has(td)").click(function(e) {
        $("#header td").removeClass("highlight");
        var clickedCell = $(e.target).closest("td");
        clickedCell.addClass("highlight");
    });

});




//Initialize Firebase Anitha's firebase
// var config = {
//     apiKey: "AIzaSyD3ZxX10HVxgcL5LjoGS-ZYKW1-D2BJo1s",
//     authDomain: "whois-405ee.firebaseapp.com",
//     databaseURL: "https://whois-405ee.firebaseio.com",
//     projectId: "whois-405ee",
//     storageBucket: "whois-405ee.appspot.com",
//     messagingSenderId: "381587866135"
// };

// firebase.initializeApp(config);

// var database = firebase.database();

// var usersArray = [];

// // This call to the DB is going to retrieve the list of users and store them in the userArray array.
// database.ref().on('value', function(userSnapshot) {
//     console.log(userSnapshot.val());
//     userSnapshot.forEach(element => {
//         console.log(element.val().Name);
//         usersArray.push(element.val().Name);
//     });
//     $.each(usersArray, function(i, obj) {
//         var div_data = "<option value=" + obj + ">" + obj + "</option>";
//         $(div_data).appendTo('#userList');
//     });

// });

// $('#userList').change(function() {
//     var selectedUser = $(this).find(":selected").text();
//     console.log("selectedUser : " + selectedUser);
//     renderChart(selectedUser);
// });

// function renderChart(user) {

//     var childData = [];

//     // event.preventDefault();

//     var userRef = database.ref(user);
//     console.log(user);
//     var parentRef = userRef.parent;
//     console.log("parentRef : " + parentRef);

//     database.ref(parentRef).on('value', function(snapshot) {
//         snapshot.forEach(function(childSnapshot) {
//             childData.push(childSnapshot.val());
//             console.log(childSnapshot.val());
//         });

//         console.log(childData);

//         new Chart(document.getElementById("bar-chart"), {
//             type: 'bar',
//             data: {
//                 labels: ["Agreeableness", "Conscientiousness", "EmotionalRange", "Extraversion", "Openness"],
//                 datasets: [{
//                     label: "Personality Chart",
//                     backgroundColor: ["blue", "orange", "teal", "red", "purple"],
//                     // data: [0.2, 0.4, 0.6, 0.8, 1.0]
//                     data: childData
//                 }]
//             },
//             // Configuration options go here
//             options: {
//                 legend: { display: false },
//                 title: {
//                     display: true,
//                     text: 'Personality Data'
//                 },
//                 scales: {
//                     yAxes: [{
//                         ticks: {
//                             beginAtZero: true
//                         }
//                     }]
//                 }
//             }
//         });
//     });
// }