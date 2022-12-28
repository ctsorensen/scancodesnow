
/*
TODO
- hover, clicked states for all buttons
- on paste, if not image, show some feedback, tooltip in pasteImage function
- paste from clipboard button
     - try to get around extra context menu paste for Safari
     - hide for firefox, not clipboard.read not supported. Or tooltip?. Check if functionality supported, if not, disable button and show tooltip on hover.
        - "This button isn't supported on this a browser. Try antoher"
- download fonts and icons so they don't load in after a second. Annoying.
- uploading barcode to small screen makes scanning worse (idk what can be done)
- If not successful, show some sort of tip to make sure it's cropped properly. 'Make sure the barcode is the most visible part of the image' or smthng
-Solved? safari executes a change event on paste, now its pasting double :( ) -- new safari (15 doesn't do this)


NOT POSSIBLE 
- allow to right click paste from context menu,


Thinkpad
- on paste, if not an image, show a tooltip. On "Paste" press, and on "cmd + v"
*/



const html5QrCode = new Html5Qrcode(/* element id */ "reader",); /*createCanvasElement --> perhaps include bootstrap class when creating <canvas> element, or wrap canvas in such a div --,, computeCanvasDrawConfig, in html5-qrcode.js */ 
// File based scanning

const fileInput = document.getElementById('input-file');
const uploadButton = document.getElementById('uploadButton');
const pasteButton = document.getElementById('pasteButton');
const controls = document.getElementById('controls');
const orDragLabels = document.getElementById('orDragLabels');

var pasteButtonSupported;

window.addEventListener("load", (event) => {
  console.log("page is fully loaded");
  const tooltips = document.querySelectorAll('.tt');
  tooltips.forEach(t => {
    new bootstrap.Tooltip(t,({
      trigger: 'manual',
      container: 'body'
   }));
  });
  ///check if clipboard-write is supported (all but Firefox)
    const clipboardReadPermission = navigator.permissions.query({ name: 'clipboard-read' })
    .then((permissionObj)=> {
      //check permission object
      if(permissionObj.state === 'granted'){
        console.log('granted');
        pasteButtonSupported = true;
      } else if(permissionObj.state === 'denied'){
        console.log('clipboard-read permission denied');
        pasteButtonSupported = false;
      }
    })
    .catch((error)=> {
      //couldn't query permission ... not supported
      console.log('clipboard-read not supported');
      pasteButtonSupported = false;
      //console.error("error message: "+error);
    });
  });

fileInput.addEventListener('change', e => {
  // Prevent the default behavior.
  e.preventDefault();
  
  
  console.log('change event');
  if (e.target.files.length == 0) {
    // No file selected, ignore 
    console.log('no file selected');
    const elem = document.getElementById('reader');

    const tooltip = bootstrap.Tooltip.getInstance(elem);
  
    elem.setAttribute("data-bs-original-title","Pasted data is not an image");
    tooltip.show();
    //readerOutline.disabled = true;
    setTimeout(()=>{
      tooltip.hide();
      //elem.disabled = false;
    }, 2000);
    
    return;
  } 

  console.log('file selected');
  const imageFile = e.target.files[0];
  var scanSuccessShowing = document.getElementById('scan_success_section');

  //scan
  html5QrCode.scanFile(imageFile, true)
  .then(decodedText => {
  
    if (document.getElementById('scan_error_section') != null){
      //if error already showing, remove it
      console.log('removing error message');
      const errorToRemove = document.getElementById('scan_error_section');
      errorToRemove.remove();
    }

    
    if (scanSuccessShowing == null) {
      //scan_success_section doesn't already exist, need to create
      console.log('scan success section does not exist, creating...');

      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan_success_section';
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      
      successfulScan.innerHTML = '<p id="scan_success_label">Scan result</p><div id="scan_success"><div class="row"><div class="col my-auto" style=""><p id="scanOutput" class=""style="text-align:left; display: inline; word-wrap: break-word; word-break: break-all; user-select: all ">'+decodedText+'</p></div><div class="col-sm-auto align-self-center" style=""><button data-container="body" id="copyButton" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title=""><span class="material-symbols-rounded" style="vertical-align: middle;"> content_copy </span>Copy</button></div></div></div>';
      
      primaryColumn.insertBefore(successfulScan, scanForm.nextSibling );

      const tooltips = document.querySelectorAll('.tt');
      tooltips.forEach(t => {
      new bootstrap.Tooltip(t,({
        trigger: 'manual',
        container: 'body'
    }));
});
    } else if (scanSuccessShowing != null){
      //scan_success_section does exist, remove it and replace with a new one (so it animates in)
      console.log('scan success section exists, replacing...');

      const scanSuccessToRemove = document.getElementById('scan_success_section');
      scanSuccessToRemove.remove();

      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan_success_section';
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      
      successfulScan.innerHTML = '<p id="scan_success_label">Scan result</p><div id="scan_success"><div class="row"><div class="col my-auto" style=""><p id="scanOutput" class=""style="text-align:left; display: inline; word-wrap: break-word; word-break: break-all; user-select: all ">'+decodedText+'</p></div><div class="col-sm-auto align-self-center" style="justify-content:"><button data-container="body" id="copyButton" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title=""><span class="material-symbols-rounded" style="vertical-align: middle;"> content_copy </span>Copy</button></div></div></div>';
      
      primaryColumn.insertBefore(successfulScan, scanForm.nextSibling );

      const tooltips = document.querySelectorAll('.tt');
      tooltips.forEach(t => {
        new bootstrap.Tooltip(t,({
          trigger: 'manual',
          container: 'body'
       }));
      });
    }

  })
  .catch(error => {
    // failure, handle it.
    console.log('error');
    //checking if an error is already showing, if so, remove it.
    if (document.getElementById('scan_error_section') != null){
      console.log('removing error message');
      const errorToRemove = document.getElementById('scan_error_section');
      errorToRemove.remove();
    }

    //checking if a scan_success is already showing, if so, remove it.
    if(document.getElementById('scan_success_section')){
      console.log('removing previous scan success section');
      const scanSuccessToRemove = document.getElementById('scan_success_section');
      scanSuccessToRemove.remove();
    }

    console.log('scan failure');
    const scanError = document.createElement("div");
    scanError.id = 'scan_error_section';
    scanError.classList = 'animate__animated animate__fadeInDown';
    const scanForm = document.getElementById('scan_form');
    const primaryColumn = document.getElementById('primary_column');
    const formattedError = String(error);
    //scanError.innerHTML = '<div>Error scanning file. Please ensure the barcode is clearly visible and distinguishable. '+formattedError+'</div>';
    scanError.innerHTML = '<p id="scan_error_label">Scan error</p><div id="scan_error">'+formattedError+'</div>';
    primaryColumn.insertBefore(scanError, scanForm.nextSibling );
    console.log(`Error scanning file. Reason: ${error}`);
  });
});

window.addEventListener('paste',  e => {
  //i think is necessary?
  console.log('paste');

  fileInput.files = e.clipboardData.files;
  const event = new Event('change');
  
  //maybe update a variable if a change event was already called?
  fileInput.dispatchEvent(event); 

});

window.addEventListener('input', e => {
  //necessary?
  
  console.log('input');
})

function hello(){
  console.log('hello');
}

async function pasteImage() {
  // function for paste button.
  
  console.log("pasteImage");
  console.log('is pasteButton supported?: '+pasteButtonSupported.toString());

  try {
    console.log('try1');
    //fails here at getting 
    const clipboardContents = await navigator.clipboard.read();
    console.log('try2');
    for (const item of clipboardContents) {
      if (!item.types.includes('image/png')) {

        const elem = document.getElementById('pasteButton');

        const tooltip = bootstrap.Tooltip.getInstance(elem);
      
        elem.setAttribute("data-bs-original-title","Pasted data is not an image");
        tooltip.show();
        //readerOutline.disabled = true;
        setTimeout(()=>{
          tooltip.hide();
          //elem.disabled = false;
        }, 2000);

        throw new Error('Clipboard contains non-image data.');
        ///show tooltip? Probably good idea.
        
      }
      const blob = await item.getType('image/png');
      //could png only be an issue?

      var file = new File([blob], "name");

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      fileInput.files = dataTransfer.files;

    }
    //then call a change event
    const event = new Event('change');
    fileInput.dispatchEvent(event);
  }catch (err) {
    console.log('catch');
    console.error(err.name, err.message);
  }
}
function copyScanOutput(){
  ///copies from the #scanOutput element
  try {
    const element = document.getElementById("scanOutput");
    const elem = document.getElementById("copyButton");

    navigator.clipboard.writeText
                (element.innerText);

  const tooltip = bootstrap.Tooltip.getInstance(elem);

  elem.setAttribute("data-bs-original-title","Copied");
  tooltip.show();
  elem.disabled = true;
  setTimeout(()=>{
    tooltip.hide();
    elem.disabled = false;
  }, 1500);
  
  }
  catch (error) {
    console.error(error.message);
  }
}

const resizeCanvasObserver = new MutationObserver(function(mutations_list) {
	mutations_list.forEach(function(mutation) {
		mutation.addedNodes.forEach(function(added_node) {
			if(added_node.id == 'qr-canvas-visible') {
				console.log('qr-canvas-visible has been added');
        let canvas = document.getElementById('qr-canvas-visible');
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.classList.add('animate__animated');
        canvas.classList.add('animate__fadeIn');
        reader.classList.remove('empty-reader-padding');
        reader.classList.add('filled-reader-padding');

        const resetButton = createResetButton();

        //i think?ß
        reader.insertBefore(resetButton, added_node );

				//Observer.disconnect(); //need to do this? if support multiple?
			}
		});
	});
});


function removeImage(){

  ///this function will remove image from the file input, get rid of the preview canvas, and restore the buttons and controls like normal.

  reader.classList.remove('filled-reader-padding');
  reader.classList.add('empty-reader-padding');
}


resizeCanvasObserver.observe(document.querySelector("#reader"), { subtree: false, childList: true });


const reader = document.getElementById('reader');

;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  reader.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults (e) {
  e.preventDefault()
  e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
  reader.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
  reader.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
  reader.classList.add('highlight')
}

function unhighlight(e) {
  reader.classList.remove('highlight')
}

reader.addEventListener('drop', handleDrop, false)

function handleDrop(e) {
  let dt = e.dataTransfer
  let files = dt.files

  console.log('now we handle the dropped file');
  try{
    fileInput.files = files;
    console.log('fileinput.files = files exectued i think');
    const event = new Event('change');
  
    //maybe update a variable if a change event was already called?
    fileInput.dispatchEvent(event); 
  } catch {
    console.log('caught fileinput.files = files');
  }
  

 /// handleFiles(files)
}

function createResetButton() {
  const button = document.createElement('button');
  button.id ='resetButton';
  button.type = 'button';
  button.className = "btn btn-secondary btn-sm";
  button.style = "position:absolute; top:8px; right: 8px; --bs-btn-padding-x: 0.25rem; z-index: 1; width:inherit";
  button.onclick = function() {
    reset();
  }
  button.innerHTML = "<span class='material-symbols-rounded' style='vertical-align: middle;'>delete</span>";
  return button;
}

function reset() {
  // this function should clear the canvas, re-display the controls, hide reset button. Probably need to query and save them when image is uploaded, then can re-display them.
  console.log('reset button pressed');
  html5QrCode.clear();
  //now insert controls. This isn't working
  reader.appendChild(controls);
  reader.appendChild(orDragLabels);
  reader.classList.remove("filled-reader-padding");
  reader.classList.add("empty-reader-padding");
  fileInput.value = '';

  if (document.getElementById('scan_error_section') != null){
    console.log('removing error message');
    const errorToRemove = document.getElementById('scan_error_section');
    errorToRemove.remove();
  }

  //checking if a scan_success is already showing, if so, remove it.
  if(document.getElementById('scan_success_section')){
    console.log('removing previous scan success section');
    const scanSuccessToRemove = document.getElementById('scan_success_section');
    scanSuccessToRemove.remove();
  }
}
