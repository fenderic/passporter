var beersUrl = "https://api.untappd.com/v4/user/beers/";
var offset = 0;
var total = 0;
var totalWorldBeerCount = 0;
var otherUnitedStatesBeerCount = 0;
var totalUnitedStatesBeerCount = 0;
var uniqueCountryCount = 0;
var uniqueStateCount = 0;


var href = window.location.href;
console.log(href);
var queryString = href.substr(href.indexOf('#')+1, href.length-1);
console.log(queryString);
var queryStringParams = queryString.split('=');
console.log(queryStringParams);

var accessToken = "";

if (queryStringParams[0] == "access_token")
{
  accessToken = queryStringParams[1];
}
console.log("accessToken = " + accessToken);


function xhr() {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var jsonResponse = this.responseText;
      var responseObject = JSON.parse(jsonResponse);
      var totalCount = responseObject.response.total_count;
      var count = responseObject.response.beers.count;
      //console.log(responseObject);
      //console.log("(" + vm.offset + " + " + count + ") / " + totalCount);

      for (i = 0; i < count; i++) {
        // country count
        var countryFound = false;
        for (c = 0; c < countries.length; c++) {
          countryFound = false;

          if (countries[c].name == "United States" && responseObject.response.beers.items[i].brewery.country_name == "United States") {
            countryFound = true;


            if (countries[c].count == 0) {
              //console.log("UNIQUE! " + countries[c].name);
              uniqueCountryCount++;
            }

            // state count
            var stateFound = false;
            for (s = 0; s < states.length; s++) {
              stateFound = false;
              if (states[s].stateCode == responseObject.response.beers.items[i].brewery.location.brewery_state) {
                stateFound = true;

                if (states[s].count == 0) {
                  uniqueStateCount++;
                }
                states[s].count++;
                totalUnitedStatesBeerCount++;
                countries[c].count++;
                totalWorldBeerCount++;
                break;
              }
            }

            if (stateFound == false) {
              console.log("State Not Found");
              console.log(responseObject.response.beers.items[i].brewery);
              otherUnitedStatesBeerCount++;
              totalUnitedStatesBeerCount++;
              countries[c].count++;
              totalWorldBeerCount++;
              break;
            }
            break;
          }

          // country count
          if (countries[c].name == responseObject.response.beers.items[i].brewery.country_name) {
            countryFound = true;

            if (countries[c].count == 0) {
              console.log("UNIQUE! " + countries[c].name);
              uniqueCountryCount++;
            }

            countries[c].count++;
            totalWorldBeerCount++;
            break;
          }
        }

        if (countryFound == false) {
          console.log("Country Not Found");
          console.log(responseObject.response.beers.items[i].brewery);
          break;
        }
      }

    if (count < 50) {
      populateTables();
      // drawMap();
    } else {
      // continue looping
      xhr();
    }
  }
}.bind(request, this);

var URL = "";
URL = this.beersUrl;
URL += "?" + "access_token=" + accessToken + "&client_id=84AC1B978F124D4C503D8B8E58C775ED72F0C159&client_secret=E806DEA8561C097F702D588F03E727A38F169F10";
URL += "&offset=" + this.offset;
URL += "&limit=50";
this.offset += 50;

request.open("GET", URL, true);
request.send();
//console.log(URL);
};

function populateTables() {
  console.log("begin populateTables");

  // Countries
  var countryContainer = document.getElementById("countryContainer");

  var countryHeader = document.createElement("h1");
  countryHeader.appendChild(document.createTextNode("Countries"));
  countryContainer.appendChild(countryHeader);

  countryContainer.appendChild(document.createTextNode("Wow! You've drank beers from " + uniqueCountryCount + " different countries!"));

  var countryToggle = document.createElement("a");
  countryToggle.setAttribute("class", "button");
  countryToggle.setAttribute("onclick", "ToggleEmptyCountries()");
  countryToggle.appendChild(document.createTextNode("Toggle Empty Rows"));
  countryContainer.appendChild(countryToggle);

  var countryTable = document.createElement("table");

  var thead = document.createElement("thead");
  var tr = document.createElement("tr");

  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Country"));
  tr.appendChild(th);
  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Beers"));
  tr.appendChild(th);
  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Info"));
  tr.appendChild(th);

  thead.appendChild(tr);
  countryTable.appendChild(thead);
  countryContainer.appendChild(countryTable);

  var tbody = document.createElement("tbody");

  for (var i = 0 ; i < countries.length; i++) {
    var tr = document.createElement("tr");

    if (countries[i].count == 0) {
      tr.setAttribute("class", "EmptyCountry");
    }

    var td = document.createElement("td");
    var span = document.createElement("span");
    span.setAttribute("class", "flag");
    var flag = document.createTextNode(countries[i].flagCode);
    var countryName = document.createTextNode(" " + countries[i].displayName);
    span.appendChild(flag);
    td.appendChild(span);
    td.appendChild(countryName);
    tr.appendChild(td);

    var td = document.createElement("td");
    var countryBeerCount = document.createTextNode(countries[i].count);
    td.appendChild(countryBeerCount);
    tr.appendChild(td);

    var td = document.createElement("td");

    var a = document.createElement("a");
    a.href = "https://untappd.com/beer/top_rated?country_id=" + countries[i].id;
    a.title = "Top Rated Beers from " + countries[i].displayName + " | Untappd";
    a.target = "_blank"
    a.appendChild(document.createTextNode("Top Beers"));
    td.appendChild(a);
    td.appendChild(document.createTextNode(" | "));

    var a = document.createElement("a");
    a.href = "https://untappd.com/brewery/top_rated?country_id=" + countries[i].id;
    a.title = "Top Rated Breweries from " + countries[i].displayName + " | Untappd";
    a.target = "_blank"
    a.appendChild(document.createTextNode("Top Breweries"));
    td.appendChild(a);

    if (countries[i].count) {
      td.appendChild(document.createTextNode(" | "));
      var a = document.createElement("a");
      a.href = "https://untappd.com/user/beers?country_id=" + countries[i].id;
      a.title = "User's Unique Check-ins of Beers from " + countries[i].displayName + " | Untappd";
      a.target = "_blank"
      a.appendChild(document.createTextNode("User History"));
      td.appendChild(a);
    }

    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  countryTable.appendChild(tbody);

  var tfoot = document.createElement("tfoot");
  var tr = document.createElement("tr");

  var td = document.createElement("td");
  td.appendChild(document.createTextNode("Total"));
  tr.appendChild(td);

  var td = document.createElement("td");
  td.setAttribute("colSpan", "2");
  td.appendChild(document.createTextNode(totalWorldBeerCount));
  tr.appendChild(td);

  tfoot.appendChild(tr);

  countryTable.appendChild(tfoot);

  // States
  var stateContainer = document.getElementById("stateContainer");

  var stateHeader = document.createElement("h1");
  stateHeader.appendChild(document.createTextNode("States"));
  stateContainer.appendChild(stateHeader);

  stateContainer.appendChild(document.createTextNode("Wow! You've drank beers from " + uniqueStateCount + " different states in the US!"));

  var stateToggle = document.createElement("a");
  stateToggle.setAttribute("class", "button");
  stateToggle.setAttribute("onclick", "ToggleEmptyStates()");
  stateToggle.appendChild(document.createTextNode("Toggle Empty Rows"));
  stateContainer.appendChild(stateToggle);

  var stateTable = document.createElement("table");

  var thead = document.createElement("thead");
  var tr = document.createElement("tr");

  var th = document.createElement("th");
  th.appendChild(document.createTextNode("State"));
  tr.appendChild(th);
  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Beers"));
  tr.appendChild(th);

  thead.appendChild(tr);
  stateTable.appendChild(thead);
  stateContainer.appendChild(stateTable);

  var tbody = document.createElement("tbody");

  for (var i = 0 ; i < states.length; i++) {
    var tr = document.createElement("tr");

    if (states[i].count == 0) {
      tr.setAttribute("class", "EmptyState");
    }

    var td = document.createElement("td");
    var stateName = document.createTextNode(" " + states[i].name);
    td.appendChild(stateName);
    tr.appendChild(td);

    var td = document.createElement("td");
    var stateBeerCount = document.createTextNode(states[i].count);
    td.appendChild(stateBeerCount);
    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  stateTable.appendChild(tbody);

  var tfoot = document.createElement("tfoot");
  var tr = document.createElement("tr");

  var td = document.createElement("td");
  td.appendChild(document.createTextNode("Total"));
  tr.appendChild(td);

  var td = document.createElement("td");
  td.setAttribute("colSpan", "2");
  td.appendChild(document.createTextNode(totalUnitedStatesBeerCount));
  tr.appendChild(td);

  tfoot.appendChild(tr);

  stateTable.appendChild(tfoot);

  /////////////////////////////////////////////////////////
  // Badge Table
  /////////////////////////////////////////////////////////

  var badgeContainer = document.getElementById("badgeContainer");

  var badgeHeader = document.createElement("h1");
  badgeHeader.appendChild(document.createTextNode("Badges"));
  badgeContainer.appendChild(badgeHeader);

  var badgeTable = document.createElement("table");
  var thead = document.createElement("thead");
  var tr = document.createElement("tr");

  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Badge"));
  tr.appendChild(th);
  var th = document.createElement("th");
  th.appendChild(document.createTextNode("Requirement"));
  tr.appendChild(th);

  thead.appendChild(tr);
  badgeTable.appendChild(thead);
  badgeContainer.appendChild(badgeTable);

  var tbody = document.createElement("tbody");

  for (var i = 0 ; i < badges.length; i++) {
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    var img = document.createElement("img");
    img.src = "" + badges[i].image + "";
    td.appendChild(img);
    var badgeName = document.createTextNode(" " + badges[i].name);
    td.appendChild(badgeName);
    td.setAttribute("align", "center");
    tr.appendChild(td);

    var td = document.createElement("td");
    var badgeHint = document.createTextNode(badges[i].hint);
    td.appendChild(badgeHint);
    tr.appendChild(td);

    tbody.appendChild(tr);
  }

  badgeTable.appendChild(tbody);

  console.log("end populateTables");
}

function ToggleEmptyCountries() {
  $(".EmptyCountry").toggle();
}

function ToggleEmptyStates() {
  $(".EmptyState").toggle();
}
