//Configuring your Qlik Sense host
var prefix = window.location.pathname.substr(
  0,
  window.location.pathname.toLowerCase().lastIndexOf("/extensions") + 1
);
//To define the actual Qlik associative engine connection, which is used when you open an app or get a list of apps. This is covered by the config JavaScript object, used as a parameter in the openApp call.*/
var config = {
  host: window.location.hostname,
  prefix: prefix,
  port: window.location.port,
  isSecure: window.location.protocol === "https:",
};
//To define where the Qlik Sense client side software and extensions should be loaded from. This is achieved by configuring RequireJS with the require.config call and setting the baseUrl.
require.config({
  baseUrl:
    (config.isSecure ? "https://" : "http://") +
    config.host +
    (config.port ? ":" + config.port : "") +
    config.prefix +
    "resources",
});
//Setting the global require and alert. RequireJS is used as a module loader
require(["js/qlik"], function (qlik) {
  qlik.setOnError(function (error) {
    $("#popupText").append(error.message + "<br>");
    $("#popup").fadeIn(1000);
  });
  $("#closePopup").click(function () {
    $("#popup").hide();
  });
  //open apps -- inserted here --

  //Logic for Reload Time
  app.getAppLayout().then((e) => {
    console.log("reload time received");
    var reloadTime = e.layout.qLastReloadTime;
    $('[class="reloadTime"]').text(reloadTime);
  });
  window.qlik = qlik;
  window.app = app;
  //get objects -- inserted here --

  /* Export Button logic for 2 tables. Pls change object IDs accordingly*/
  /*
	app.getObject('QVChart10','WrTk').then(function(reply){
	var qTable = qlik.table(reply);
	$('#ExportButton1').click( function ( ) {
							qTable.exportData({download: true});
							});
		
});	

app.getObject('QVChart11','jkpGX').then(function(reply){
	var qTable = qlik.table(reply);
	$('#ExportButton2').click( function ( ) {
							qTable.exportData({download: true});
							});
		
});	
//End logic for Table Export
*/
  //callbacks -- inserted here --
  function KPIhc(reply, app) {
    //console.log(reply);
    $("#QVKPI1")[0].innerText =
      reply.qHyperCube.qDataPages[0].qMatrix[0][0].qText;
    $("#QVKPI2")[0].innerText =
      reply.qHyperCube.qDataPages[0].qMatrix[0][1].qText;
    $("#QVKPI3")[0].innerText =
      reply.qHyperCube.qDataPages[0].qMatrix[0][2].qText;
  }
  //create cubes and lists -- inserted here --
  app.createCube(
    {
      qInitialDataFetch: [
        {
          qHeight: 20,
          qWidth: 3,
        },
      ],
      qDimensions: [],
      qMeasures: [
        {
          qDef: {
            qDef: "pick(ceil(log10(sum(LineSalesAmount))/3),\r\n\n          num(sum(LineSalesAmount),'#,##0.0'),\n\n          num(sum(LineSalesAmount)/1000,'#,##0.0 K'),\n\n          num(sum(LineSalesAmount)/1000000,'#,##0.0 M')\n\n     )   & ''",
          },
          qLabel: "KPI1",
          qLibraryId: null,
          qSortBy: {
            qSortByState: 0,
            qSortByFrequency: 0,
            qSortByNumeric: 0,
            qSortByAscii: 1,
            qSortByLoadOrder: 0,
            qSortByExpression: 0,
            qExpression: {
              qv: " ",
            },
          },
        },
        {
          qDef: {
            qDef: "Count(Country)",
          },
          qLabel: "KPI2",
          qLibraryId: null,
          qSortBy: {
            qSortByState: 0,
            qSortByFrequency: 0,
            qSortByNumeric: 0,
            qSortByAscii: 1,
            qSortByLoadOrder: 0,
            qSortByExpression: 0,
            qExpression: {
              qv: " ",
            },
          },
        },
        {
          qLabel: "Margin",
          qLibraryId: "AxGzSg",
          qSortBy: {
            qSortByState: 0,
            qSortByFrequency: 0,
            qSortByNumeric: 0,
            qSortByAscii: 1,
            qSortByLoadOrder: 0,
            qSortByExpression: 0,
            qExpression: {
              qv: " ",
            },
          },
        },
      ],
      qSuppressZero: false,
      qSuppressMissing: false,
      qMode: "S",
      qInterColumnSortOrder: [],
      qStateName: "$",
    },
    KPIhc
  );
  //Grab Current Selections
  app.getList("SelectionObject", function (reply) {
    $selections = $("#currSelections");
    $selections.html("");
    //Setting Starting variable
    var selectionsObject = reply.qSelectionObject.qSelections;
    var selectionsObjectlength = reply.qSelectionObject.qSelections.length;
    //console.log(reply.qSelectionObject.qSelections.length);
    //Total Selections Badge
    var initialValue = 0;
    var totalSelections = selectionsObject.reduce(function (acc, cur) {
      return acc + cur.qSelectedCount;
    }, initialValue);
    if (totalSelections == 0) {
      $(".notification .badge").hide();
    } else {
      $(".notification .badge").show().html(selectionsObjectlength);
    }
    //Loop through selections and append to modal
    $.each(selectionsObject, function (key, value) {
      //Setting Starting variables
      var field = value.qField;
      var numSelected = value.qSelectedCount;
      var total = value.qTotal;
      var threshold = 3;
      var selectedStr = value.qSelected;
      if (numSelected <= threshold) {
        var html = "";
        html += "<span class='selected-field-container' id='" + field + "'>";
        html += "<span class='selected-field'>" + field + ": </span>";
        html += selectedStr;
        html += "<span class='clear-field'>X</span>";
        html += "</span>";
        $selections.append(html);
      } else {
        var html = "";
        html += "<span class='selected-field-container' id='" + field + "'>";
        html += "<span class='selected-field'>" + field + ": </span>";
        html += numSelected + " of " + total;
        html += "<span class='clear-field'>X</span>";
        html += "</span>";
        $selections.append(html);
      }
    });
    //Clear selection
    $(".clear-field").click(function () {
      var field = $(this).parent().attr("id");
      app.field(field).clear();
    });
  });
  //selections Navigation
  $("[data-control]").click(function () {
    var $element = $(this);
    switch (
      $element.data("control") ////we are targeting that element using jquery
    ) {
      case "clear":
        app.clearAll();
        break;
      case "back":
        app.back();
        break;
      case "forward":
        app.forward();
        break;
    }
  });
  //Upon Click of Bookmark New
  $("#newBm").click(function () {
    $("#formModal").toggle(true);
    $("#createBm").prop("disabled", false);
    $("#newBm").prop("disabled", true);
  });
  //Create Bookmark
  $("#createBm").click(function () {
    var title = $("#bmTitle").val();
    var desc = $("#bmDesc").val();
    //apply bookmark
    app.bookmark.create(title, desc).then(function () {
      //save app
      app.doSave();
    });
    $("#bmTitle").val("");
    $("#bmDesc").val("");
    $("#formModal").toggle(false);
    $("#createBm").prop("disabled", true);
    $("#newBm").prop("disabled", false);
  });
  $("#bmCloseButton").click(function () {
    $("#bmTitle").val("");
    $("#bmDesc").val("");
    $("#formModal").toggle(false);
    $("#createBm").prop("disabled", true);
    $("#newBm").prop("disabled", false);
  });
  //Return List of Bookmarks
  app.getList("BookmarkList", function (reply) {
    var str = "";
    reply.qBookmarkList.qItems.forEach(function (value) {
      str +=
        '<li class="list-group-item"><a class="list-container" data-id="' +
        value.qInfo.qId +
        '">' +
        '<span class="bm-title-text">' +
        value.qData.title +
        "</span>" +
        '<span class="bm-title-desc">' +
        value.qData.description +
        "</span></a>" +
        '<i class="fas fa-trash"' +
        'data-id="' +
        value.qInfo.qId +
        '"></i></li>';
    });
    $(".list-group").html(str);
    $(".list-container").click(function () {
      var id = $(this).data("id");
      app.bookmark.apply(id);
      $("#bookmarkModal").modal("hide");
    });
    $(".fa-trash").click(function () {
      var id = $(this).data("id");
      app.bookmark.remove(id).then(function () {
        //save app
        app.doSave();
      });
      $("#bookmarkModal").modal("hide");
    });
  });
  // find the bootstrap tab changing event
  // invoke qlik.resize(); in it
  // This is used for resizing qlik charts when the navigation tabs and filter/selections tabs are triggered
  $('a[data-toggle="tab"],[data-toggle="pill"]').on(
    "shown.bs.tab",
    function () {
      // console.log('resize')
      qlik.resize();
    }
  );
  // This is used for resizing qlik charts when the filter panel and navigation side bar are triggered
  $(
    '[data-toggle="canvas"][aria-expanded="false"],.bs-canvas-close,.hamburger'
  ).on("click", function () {
    setTimeout(() => {
      //console.log('resize');
      qlik.resize();
    }, 500);
  });
  // make sure to get only the relevant qlik objects within active tab
  $(".nav-tabs > a").on("shown.bs.tab", function (a) {
    console.log(a.currentTarget.hash);
    var objToActivate = $(a.currentTarget.hash).find(".qvobject");
    objToActivate.each(function (index) {
      var $obj = $(objToActivate[index]);
      var divId = $obj.attr("id");
      var vizId = $obj
        .find(".qv-object-content-container div")
        .attr("id")
        .split("_")[0];
      app.visualization.get(vizId).then(function (viz) {
        viz.show(divId);
        console.log("activate qlikId: " + vizId + " into divId: " + divId);
      });
    });
  });
  // hide
  $(".nav-tabs > a").on("hide.bs.tab", function (a) {
    console.log(a.currentTarget.hash);
    var objsToClose = $(a.currentTarget.hash).find(".qvobject");
    console.log(objsToClose);
    objsToClose.each(function (index) {
      var $obj = $(objsToClose[index]);
      var vizId = $obj
        .find(".qv-object-content-container div")
        .attr("id")
        .split("_")[0];
      app.visualization.get(vizId).then(function (viz) {
        console.log("close this" + vizId);
        viz.close();
      });
    });
  });
}); //close require
