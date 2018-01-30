var clickable;
var defaultFrameRate = 5
var lookup = {};
var items = {};
var animationItem;
var animationFrame;
var soundEffects = {};
var animatingList = [];
var isAnimating;
//var triggersFound;
var totalTriggers;
//var triggersLeft;
var stop = false;
var frameCount = 0;
var nextRoom;
var bubbleActive = false;
//var currentRoom;
var startingWidth, startingHeight, aspect;
var phaseText = ["Find the Triggers", "Ways to avoid the triggers"];

var factorTranslate = 1;
var factorScale = 1;
var state;

function loadstate () {

  if (localStorage.hasOwnProperty("state")) {
    state = JSON.parse(localStorage.getItem("state"));
  } else {
    state = {}
  }
var dict =getParameters()
if (dict.length){

  state={};
}
  Object.keys(dict).forEach(function(key) {
state[key]=dict[key]
});


}
function  getParameterByName()
{

return false;

}
function getParameters(){
var dict ={};
decodeURIComponent(window.location.search).substring(1).split("&").forEach(function(val,idx){

nameVal= val.split("=");
nameVal[1]

if(nameVal[0]=="itemsClicked"){
dict[nameVal[0]]=JSON.parse( decodeURIComponent(nameVal[1]));
}
else dict[nameVal[0]]=nameVal[1]
}


);
return dict;
}
loadstate ()

function consolelog(foo) {
  //  console.log(foo)
}

var fps, fpsInterval, startTime, now, then, elapsed;
$(window).resize(function() {
  resizeScreen();
});



$(function() {

  //state.phase = 0;
  $('#phaseNum').html(phaseText[state.phase]);
  state.itemsClicked = state.itemsClicked || [];
  if (!state.hasOwnProperty("currentRoom")) {
    state.currentRoom = "bedRoom";
  }
  console.log(state, state.currentRoom)

  loadNewRoom(state.currentRoom);



  $('#scalerDiv input').on("change", function(evt) {

    var item = $('#item').val()

    factorTranslate = $('#factorTranslate').val();
    factorScale = $('#factorScale').val();
    var scale = ($('#scale').val()) * factorScale + .5;
    var translateX = ($('#translateX').val() - 50) * factorTranslate;
    var translateY = ($('#translateY').val() - 50) * factorTranslate;
    consolelog(translateX, translateY, scale);



    var cubbyItem = $("#cubbySVG_" + item).attr("transform", `translate(${translateX},${translateY}) scale(${scale})`);
    consolelog(`"Scale":"translate(${translateX},${translateY}) scale(${scale})"`)


  })
  resizeScreen();
});


//setTimeout(resizeScreen,'200');																		//	For IE
function resizeScreen() {
  var w = $(window).width();
  var h = $(window).height();

  // If the aspect ratio is greater than or equal to 4:3, fix height and set width based on height
  if ((w / h) >= aspect) {
    stageHeight = h;
    stageWidth = (aspect) * h;
    stageLeft = (w - stageWidth) / 2;
    stageTop = 0;
  }
  // If the aspect ratio is less than 4:3, fix width and set height based on width
  else {
    stageWidth = w;
    stageHeight = (aspect) * w;
    stageTop = (h - stageHeight) / 2;
    stageLeft = 0;
  }

  // Set "screen" object width and height to stageWidth and stageHeight, and center screen
  $("#screen").css({
    width: stageWidth + "px",
    height: stageHeight + "px",
    left: stageLeft + "px",
    top: stageTop + "px"
  });

  // $("#roomSVG > svg").attr({
  // 	'width': $("html").width() + 'px',
  // 	'height': $("html").width() / 1.6 + 'px'
  // }); //	For IE
  //consolelog($("html").width())
  $("html").css('fontSize', stageWidth / 70 + "px");
}

function loadNewRoom(roomName) {
  totalTriggers = 0;
  state.currentRoom = roomName;
  $('#phaseNum').html(phaseText[state.phase]);
  var Dev = "";
  $.getJSON(roomName + Dev + ".json", function(data) {
    nextRoom = data.nextRoom;
    consolelog(roomName + "what")
    clickable = data.targets;
    //$("#room").css("font-size", "100px");
    $("#roomSVG").load("img/rooms/" + data.roomImage, roomSvgLoad);

    resizeScreen();
  }).fail(function() {
    consolelog(roomName + "Dev.json");
  })
}


function roomSvgLoad() {
  //$("#treasureChest").empty();

  $("#treasureChest").empty();
  $(clickable).each(function(index, value) {

    if ("audioFile" in value) {
      soundEffects[value.Name] = ss_soundbits("audio/" + value.audioFile);
    }
    if ("isTrigger" in value) {



      var cubbyDiv = $(".cubbyCopier").clone()
      cubbyDiv.attr("id", "cubby_" + value.Name)
      cubbyDiv.attr("class", "cubbyCopy")

      $("#treasureChest").append(cubbyDiv)
      var cubbySVG = $("#cubby_" + value.Name + " svg");



      var cubbyItem = jQuery("#" + value.Name).clone();

      cubbyItem.attr("id", "cubbySVG_" + value.Name);
      var opacityVal = "1";

      if (state.itemsClicked.indexOf(value.Name) == -1) {

        opacityVal = "0";
      }

      cubbyItem.appendTo(cubbySVG).css('opacity', opacityVal);

      consolelog("cubbySVG_" + value.Name)
      cubbyItemBBox = document.getElementById("cubbySVG_" + value.Name).getBBox()
      consolelog();
      $("#cubbySVG_" + value.Name + ' g[id]').each(function(item, val) {

        var oldID = $(val).attr("id");
        $(val).attr("id", "cubbySVG_" + oldID)

      })


      document.getElementById("cubbySVG_" + value.Name).setAttribute("transform", value.thumbScale || "");
      $('.cubbyCopy').css("width", (100 / totalTriggers) + "%")
      resizeScreen();
      //  $("#cubbySVG_" + value.Name).css('opacity', '0');
      totalTriggers++;

      consolelog(value)
    }



    $("#" + value.Name).addClass("clickable")
    lookup[value.Name] = index;
    //startingWidth=$("#screen").width();
    //startingHeight=$("#screen").height();

    //aspect=startingWidth/startingHeight;
    aspect = 1 / 1
    //consolelog(aspect,$("#screen").height(),$("#roomSVG").height())
  })
  if (!("triggersLeft" in state)) {
    state.triggersLeft = totalTriggers;
  }
  console.log(state.triggersLeft, totalTriggers)
  displayTriggersLeft();
  /*
	$(".cubbyCopy").css("width", (100/totalTriggers)+"%" )

	var cubbyCount = totalTriggers
	while (cubbyCount--) {

	}
	*/

  makeClickEvents();

  var item = "Intro" || state.itemsClicked ;

  consolelog(item)
  $('#' + item).trigger('click')
  $('#item').val(item)
  //"translate(275,-350) scale(1.3)"
  //var itemObject = clickable.find(function(d){return d.Name==item})

  $('#factorTranslate').val(factorTranslate)
  $('#factorScale').val(factorScale)
  resizeScreen(); //	For IE
}

function makeClickEvents() {

  $(".clickable").on("click", function(evt) {
    if (!bubbleActive) {
      bubbleActive = true;


      consolelog(evt)

      var clickedItem = evt.currentTarget.id

      var item = clickable[lookup[clickedItem]];
      // $(evt.target).closest('.clickable').attr("id");
      itemClicked(clickedItem)



    }
  });
}

function itemClicked(clickedItem) {
  consolelog(clickedItem)
  var item = clickable[lookup[clickedItem]];


  var fps = item.frameRate || defaultFrameRate;
  if ("audioFile" in item) {

    soundEffects[item.Name].playclip();
  }
  if ("isTrigger" in item) {
    if (state.itemsClicked.indexOf(item.Name) == -1) {

      countTriggers(item);
      //  clickedList.push(clickedItem)
    }

  }

  startAnimating(fps, item);


};

function disappear(it) {


  it.animate({
      opacity: 0,
    },
    1000,
    function() {


    }
  );

  showTreasureBox(it)

}

function showTreasureBox(it) {
  var xerox = $("#cubbySVG_" + $(it).attr('id'));
  xerox.animate({
      opacity: 1,
    },
    1000,
    function() {
      transition();

    }
  );
}


function transition() {
  if (!state.triggersLeft) {
    state.triggersLeft = totalTriggers;
    console.log(state.triggersLeft + "dfsds")

    if (state.phase == 1) {

      state.currentRoom = nextRoom;
    }
    state.itemsClicked = []
    changePhase();
    loadNewRoom(state.currentRoom);
    //  return;
  }
  localStorage.setItem("state", JSON.stringify(state))
  console.log(state)
}

function thoughts(it) {
  $("#thoughtBubble").removeClass("thoughtPop");





  var alreadyClickedText = ""
  if (!(state.itemsClicked.indexOf(it.Name) == -1))

    {
      if (it.isTrigger) {
        alreadyClickedText = " <em>(You found this already!)</em>"
      }
    }
    else {
      state.itemsClicked.push(it.Name);

    }

    displayThought()


    $("#close").off("click"); $("#close").on("click", function(evt) {


      bubbleActive = false;
      $("#thoughtBubble").css({
        "display": "none"
      });
      if (it.isTrigger) {
        if (state.phase == 1) {

          disappear($("#" + it.Name));
        } else {
          showTreasureBox($("#" + it.Name));
        }

      }



    });

    function displayThought() {
      bubbleActive = true;
      consolelog(it.xValue || 50)
      $("#thoughtBubble").css({
        "left": (it.xValue || 5) + "%",
        "top": (it.yValue || 5) + "%"
      });
      $("#thoughtBubble").addClass("thoughtPop");
      $("#thoughtBubble").css("display", "inline");

      if (state.edit== "true") {

        $('#thoughtBubble p').html('<form><textarea id=txtArea></textarea> </form>');


        $('textarea#txtArea').ckeditor({
          height: "300px",
          toolbarStartupExpanded: true,
          width: "100%"
        });

        $('textarea').val(it.Text[state.phase])

        $('form').submit(function(event) {

          $.post("save.php", {
            name: it.Name,
            room: state.currentRoom,
            phase: state.phase,
            text: $('textarea').val()
          }).done(function(data) {
            window.location = "?edit=True&item=" + it.Name + "&room=" + state.currentRoom + "&phase=" + state.phase;
            ///  window.location = window.location.search
          });
          consolelog("" || it.Name)
          event.preventDefault();
        })



      } else {
        $("#thoughtBubble p").html(it.Text[state.phase] + alreadyClickedText)
      }

    }


  }

  function countTriggers(item) {
    if (state.triggersLeft) state.triggersLeft--;
    displayTriggersLeft();
  }

  function changePhase() {
    state.phase = 1 - state.phase
  }



  function displayTriggersLeft() {

    $('#triggersLeft').html(state.triggersLeft);
  }
  // initialize the timer variables and start the animation
  function startAnimating(fps, item) {
    if (!isAnimating) {
      isAnimating = true;
      animationItem = item;
      animationItem.animationFrame = 1;
      animationItem.loopAmount = item.loopAmount | 0;
      animatingList.push(animationItem)
      fpsInterval = 1000 / fps;

      then = Date.now();
      startTime = then;
      animate();
    }
  }

  function animate() {
    if (isAnimating) requestAnimationFrame(animate);
    // calc elapsed time since last loop
    now = Date.now();
    elapsed = now - then;
    // if enough time has elapsed, dr)aw the next frame
    if (elapsed > fpsInterval) {
      then = now - (elapsed % fpsInterval);
      animatingList.forEach(function(item, index) {

        var itemID = item.Name.split("-")[0] + "-";
        var selector = "#" + itemID;
        var animationLength = 0
        //consolelog(y);
        $("[id^='" + itemID + "']").each(function(idx, val) {

            if (RegExp(itemID + '[0-9]*$').test(val.id)) {
              $(val).attr("style", "display:none")
              animationLength++;
            }


          }



        )






        if (item.animationFrame <= (animationLength * (animationItem.loopAmount + 1))) {
          //var displayFrame = (animationFrame % animationItem.totalAnimationFrames) + 1
          //wacky cal
          var displayFrame = Math.abs((item.animationFrame + animationLength - 2) % ((animationLength - 1) * 2) - (animationLength - 1)) + 1

          $(selector + displayFrame).attr("style", "display:inline")
          item.animationFrame++
        } else {
          thoughts(item);
          delete animatingList[index]
          isAnimating = false;
          if (item.stopAtEnd) {
            $(selector + animationLength).attr("style", "display:inline");
          } else {
            $(selector + 1).attr("style", "display:inline");
          }

        }
      });
    }
  }
