var scaleFactor;
var itemHeight = 20;
var puffer = 60;

var numberTimexes = 0;
var timexes = [];
var currId, dct;

var openedInput = false;
var docNr = -1;
var trackNr = 0;

var colorDate = [ "55,126,184","77,175,74","152,78,163","255,127,0","228,26,28","166,86,40" ];

function getDCT(file){ return file.match(/<DATE_TIME>([^<]*)<\/DATE_TIME>/)[1] }

function positionlabel(d,el){
  if(el=="big"){ var thisEl = $("#eventlabelBig"); var maxwidth = 300; }
  else{ var thisEl = $("#eventlabel"); var maxwidth = 200; }

  var ww = $("#topBox").width();
  var thisid = "#timelineItem_" + d.id;

  var labely = $("#topBox").height() - parseInt($(thisid).position().top)+12;
  var labelx = parseInt($(thisid).position().left);
  var toofarright = labelx>ww-maxwidth
  if(toofarright){ labelx = labelx-maxwidth } // don't know yet width of label

  thisEl.css({ left : labelx , bottom : labely , "display" : "block"})
  

  if(toofarright){
    thisEl.css({ left : (labelx+maxwidth-thisEl.width()+itemHeight/2) })
    thisEl.children("span").css({ right : 4 , left : "auto" })
  }
  else{
    thisEl.children("span").css({ right : "auto" , left : 4 })
  }
}

// Check Date Input
function validate(event,el) {

  var key = window.event ? event.keyCode : event.which;
  if(event.key == "Enter" || key == 13){
    if(!el){ $("#check").trigger('click') }
    else{ el.blur() }
  }

  if(!el){
    if (key == 8 || key == 9 || key == 46 || key == 37 || key == 39 || key == 88) { return true; }
    else if ( key < 48 || key > 57 ) { return false; }
    else{ return true; }
  }
};

// DOWNLOAD STUFF
function download(filename, text) {
    var link = document.createElement('a');
    var textFileAsBlob = new Blob([text], {type:'text/plain'});

    link.download = filename;
    link.innerHTML = "Download File";
 
    link.href = window.URL.createObjectURL(textFileAsBlob);
    link.onclick = destroyClickedElement;
    link.style.display = "none";
    document.body.appendChild(link);
    
    link.click();
  }
function destroyClickedElement(event) { document.body.removeChild(event.target); }
function triggerUpload(){ $('#uploadFile').click() }


function downloadJson(data) {
  var filename = data.timeline.headline.replace(/ /g, "_") + ".json"
  
  var thisdata = createJsonFormat(data)

    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(thisdata));
    pom.setAttribute('download', filename);
    pom.click();
  }


function createJsonFormat(data){
  var d = JSON.stringify(data)
      d = d
            .replace(/\",\"/g, "\",\n\"")
            .replace(/\":{\"/g, "\":\n{\n\"")
            .replace(/\},\"/g, "},\n\"")
            .replace(/\},\{"/g, "},\n\n{\"")
            .replace(/\":\[/g, "\":\n[\n")
            .replace(/\{\}\}\]\}\}/g, "{}}\n]\n}\n}")
    return d
}

function downloadZip(data) {
  var fileContent = createJsonFormat(data)
  var indexHtml = "static/timelineJS/index.html"
  var request = $.ajax({
    url: indexHtml,
    type: "GET",
    contentType: "application/html",
    mimeType:'text/plain; charset=x-user-defined'
  });     

  request.done(function( data ) {
    var zip = new JSZip();
    zip.file("index.html", data, { binary: true });
    zip.file("data.json",fileContent);
    content = zip.generate();
    location.href = "data:application/zip;base64," + content;
  });       
  }



// DOWNLOAD STUFF END



// Behaviour
function openInput(){
    $("#inputOverlay").fadeIn(300);
    $(".chooseTrack").removeClass("chosen")
    $("#chooseTrack_"+(trackNr)).addClass("chosen")
    var today = getToday()
    $("#todayInput").val(today)
    if(!openedInput){
      $(".chooseTrack").on( "click" , function(){
        $(".chooseTrack").removeClass("chosen")
        // CONTINUE HERE
        trackNr = $(this).attr("id").split("_")[1]
        $("#"+$(this).attr("id")).addClass("chosen")
      })
      openedInput = true;
    }
    $(document).on("keydown" , exitOverlay )
}

function exitOverlay(e){ if(e.keyCode == 27){ closeInput() } }

function closeInput(){
  $(document).off("keydown",exitOverlay)
  $("#inputOverlay").fadeOut(300);
  $('#inputOverlay input[name="title"]').val("")
  $('#inputOverlay input[name="date"]').val("")
  $('#inputOverlay textarea[name="content"]').val("")
  $('#inputOverlay input[name="source"]').val("")
}