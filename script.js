
/*
TODO
- create scancodesnow.com examples for all formats
- scan error label alignment is different from scan success
- just pin copy button to right.
- smallest viewport 320px wide, scale font so one line?
- Button spacing/sizing consistency. Hover, clicked states for all buttons. 
- Clean up and annotate JS file
- download fonts so they don't load in after a second. Annoying.
- uploading barcode to small screen makes scanning worse (idk what can be done)
- error messages:
-     there's only 1 error: message should say a few things: make sure it's the correct format (with ability for examples?), make sure it's horizontal, make sure barcode is clearly visible and not blurry.  without anything else around it.
-     modal for examples. Launch from button in error. 2x2 cards. https://getbootstrap.com/docs/5.0/components/modal/ scrolling long content.
- NOPE, gotta fix: when adding a file, ui jumps b/c col-auto resizing. Wanted to try to maximize the canvas size within reason, so that scanning is more accurate from the library



-Solved? safari executes a change event on paste, now its pasting double :( ) -- new safari (15 doesn't do this)


NOT POSSIBLE 
- allow to right click paste from context menu,


*/



const html5QrCode = new Html5Qrcode(/* element id */ "reader",); /*createCanvasElement --> perhaps include bootstrap class when creating <canvas> element, or wrap canvas in such a div --,, computeCanvasDrawConfig, in html5-qrcode.js */ 
// File based scanning

const fileInput = document.getElementById('input-file');
const uploadButton = document.getElementById('upload-button');
const pasteButton = document.getElementById('paste-button');
const controls = document.getElementById('controls');
const orDragLabels = document.getElementById('or-drag-labels');

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

  // Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  if (isFirefox){pasteButtonSupported = false;}
  if (pasteButtonSupported == false){
      pasteButton.classList.add('d-none');
    }

  //NOTE, below was to check if clipboard-read is supported (is in all but firefox), removed b/c safari supports it but can't check in this way.
  //so instead, will just check for firefox to set pasteButtonSupported to true.
  ///check if clipboard-write is supported (all but Firefox)
  /*  
  const clipboardReadPermission = navigator.permissions.query({name: 'clipboard-read' })
    .then((permissionObj)=> {
      //check permission object
      if(permissionObj.state === 'granted'){
        console.log('granted');
        pasteButtonSupported = true;
        if(pasteButtonSupported == false){
          pasteButton.classList.add('d-none');
        } else if(pasteButton.classList.contains('d-none')){
          pasteButton.classList.remove('d-none');
        }{
         
        }
      } else if(permissionObj.state === 'denied'){
        console.log('clipboard-read permission denied');
        pasteButtonSupported = false;
        if(pasteButtonSupported == false){
          pasteButton.classList.add('d-none');
        }
      }
    })
    .catch((error)=> {
      //couldn't query permission ... not supported
      console.log('clipboard-read not supported');
      pasteButtonSupported = false;
      if(pasteButtonSupported == false){
        pasteButton.classList.add('d-none');
      }
      //console.error("error message: "+error);
    });

    */
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
  
    elem.setAttribute("data-bs-original-title","What you pasted is not an image");
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
  var scanSuccessShowing = document.getElementById('scan-success-section');

  //scan
  html5QrCode.scanFile(imageFile, true)
  .then(decodedText => {
  
    if (document.getElementById('scan-error-section') != null){
      //if error already showing, remove it
      console.log('removing error message');
      const errorToRemove = document.getElementById('scan-error-section');
      errorToRemove.remove();
    }

    
    if (scanSuccessShowing == null) {
      //scan-success-section doesn't already exist, need to create
      ///the problem!!!! When this is created, it goes way too wide.
      console.log('scan success section does not exist, creating...');

      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan-success-section';
      // successfulScan.style.minWidth = '100%';
      // successfulScan.style.width = '0';
     
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      
      // successfulScan.innerHTML = '<p id="scan-success-label">Scan result</p><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div><div class="col-sm-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></button></div></div>';
      successfulScan.innerHTML = '<div class="row"><div class="col align-self-center"><p id="scan-success-label">Scan result</p></div><div class="col-sm-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></div></div><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div></div></div>';

      primaryColumn.insertBefore(successfulScan, scanForm.nextSibling );

      const tooltips = document.querySelectorAll('.tt');
      tooltips.forEach(t => {
      new bootstrap.Tooltip(t,({
        trigger: 'manual',
        container: 'body'
        }));
      }); 
    } else if (scanSuccessShowing != null){
      //scan-success-section does exist, remove it and replace with a new one (so it animates in)
      console.log('scan success section exists, replacing...');

      const scanSuccessToRemove = document.getElementById('scan-success-section');
      scanSuccessToRemove.remove();

      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan-success-section';
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      
      // successfulScan.innerHTML = '<p id="scan-success-label">Scan result</p><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div><div class="col-sm-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></div></div></div>';
      successfulScan.innerHTML = '<div class="row"><div class="col align-self-center"><p id="scan-success-label">Scan result</p></div><div class="col-sm-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></div></div><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div></div></div>';

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
    if (document.getElementById('scan-error-section') != null){
      console.log('removing error message');
      const errorToRemove = document.getElementById('scan-error-section');
      errorToRemove.remove();
    }

    //checking if a scan-success is already showing, if so, remove it.
    if(document.getElementById('scan-success-section')){
      console.log('removing previous scan success section');
      const scanSuccessToRemove = document.getElementById('scan-success-section');
      scanSuccessToRemove.remove();
    }

    console.log('scan failure');
    const scanError = document.createElement("div");
    scanError.id = 'scan-error-section';
    scanError.classList = 'animate__animated animate__fadeInDown';
    const scanForm = document.getElementById('scan_form');
    const primaryColumn = document.getElementById('primary_column');
    //note: Seems to be only one error from HTML5QR code library on scan failure and it's not very helpful. Replacing it.
    //const formattedError = String(error);
    const formattedError = "<p>Make sure the barcode you want to scan is large, clearly visible, and one of the <a id='supported-formats-text' href='#' data-bs-toggle='modal' data-bs-target='#supportedFormatsModal'>supported formats</a>.</p>"

    //scanError.innerHTML = '<div>Error scanning file. Please ensure the barcode is clearly visible and distinguishable. '+formattedError+'</div>';
    scanError.innerHTML = '<p id="scan-error-label">Scan error</p><div id="scan-error">'+ formattedError+'</div>';
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
  console.log('is paste button supported?: '+pasteButtonSupported.toString());

  try {
    console.log('try1');
    //fails here at getting 
    const clipboardContents = await navigator.clipboard.read();
    console.log('try2');
    for (const item of clipboardContents) {
      if (!item.types.includes('image/png')) {

        const elem = document.getElementById('paste-button');

        const tooltip = bootstrap.Tooltip.getInstance(elem);
      
        elem.setAttribute("data-bs-original-title","What you pasted is not an image");
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
  ///copies from the #scan_output element
  try {
    const element = document.getElementById("scan-success-output");
    const elem = document.getElementById("copy-button");

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
        console.log('current width: '+canvas.style.width.toString());
        canvas.style.width = "auto";
        console.log('width to auto');
        canvas.style.height = "100%";
        console.log('current width: '+canvas.style.width.toString());

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
  button.id ='reset-button';
  button.type = 'button';
  button.className = "btn btn-secondary btn-sm";
  // button.style = "position:absolute; top:8px; right: 8px; --bs-btn-padding-x: 0.25rem; z-index: 1; width:inherit; color: #ffffff;  background-color: #585858; border-color: #585858; border-radius: 3;";
  
  button.onclick = function() {
    reset();
  }
  //button.innerHTML = "<span class='material-symbols-rounded button-icon'>delete</span>";
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

  if (document.getElementById('scan-error-section') != null){
    console.log('removing error message');
    const errorToRemove = document.getElementById('scan-error-section');
    errorToRemove.remove();
  }

  //checking if a scan-success is already showing, if so, remove it.
  if(document.getElementById('scan-success-section')){
    console.log('removing previous scan success section');
    const scanSuccessToRemove = document.getElementById('scan-success-section');
    scanSuccessToRemove.remove();
  }
}
