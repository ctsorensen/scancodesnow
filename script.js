
const html5QrCode = new Html5Qrcode("reader",); 
// File based scanning

const fileInput = document.getElementById('input-file');
const uploadButton = document.getElementById('upload-button');
const pasteButton = document.getElementById('paste-button');
const controls = document.getElementById('controls');
const orDragLabels = document.getElementById('or-drag-labels');
var pasteButtonSupported;

//Setup
window.addEventListener("load", (event) => {
  const tooltips = document.querySelectorAll('.tt');
  tooltips.forEach(t => {
    new bootstrap.Tooltip(t,({
      trigger: 'manual',
      container: 'body'
   }));
  });

  // Check if Firefox 1.0+
  var isFirefox = typeof InstallTrigger !== 'undefined';
  if (isFirefox){pasteButtonSupported = false;} else {
    pasteButtonSupported = true;
  }
  if (pasteButtonSupported == false){
      pasteButton.classList.add('d-none');
    }
});

//Displays image file on the canvas and scans it.
fileInput.addEventListener('change', e => {
  e.preventDefault();
  
  // No file selected, ignore 
  if (e.target.files.length == 0) {
    const elem = document.getElementById('reader');
    const tooltip = bootstrap.Tooltip.getInstance(elem);
    elem.setAttribute("data-bs-original-title","What you pasted \n is not an image");
    tooltip.show();
    setTimeout(()=>{
      tooltip.hide();
    }, 2000);
    return;
  } 

  //File selected
  const imageFile = e.target.files[0];
  var scanSuccessShowing = document.getElementById('scan-success-section');

  //Scan
  html5QrCode.scanFile(imageFile, true)
  .then(decodedText => {
    if (document.getElementById('scan-error-section') != null){
      //if error already showing, remove it
      console.log('removing error message');
      const errorToRemove = document.getElementById('scan-error-section');
      errorToRemove.remove();
    }
    
    if (scanSuccessShowing == null) {
      //scan-success-section doesn't already exist, creating...
      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan-success-section';
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      successfulScan.innerHTML = '<div class="row"><div class="col align-self-center"><p id="scan-success-label">Scan result</p></div><div class="col-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></div></div><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div></div></div>';
      primaryColumn.insertBefore(successfulScan, scanForm.nextSibling );
      //setup tooltips
      const tooltips = document.querySelectorAll('.tt');
      tooltips.forEach(t => {
      new bootstrap.Tooltip(t,({
        trigger: 'manual',
        container: 'body'
        }));
      }); 
    } else if (scanSuccessShowing != null){
      //scan-success-section does exist, remove it and replace with a new one (so it animates in)
      const scanSuccessToRemove = document.getElementById('scan-success-section');
      scanSuccessToRemove.remove();
      const successfulScan = document.createElement("div");
      successfulScan.id = 'scan-success-section';
      successfulScan.classList = 'animate__animated animate__fadeInDown';
      const scanForm = document.getElementById('scan_form');
      const primaryColumn = document.getElementById('primary_column');
      successfulScan.innerHTML = '<div class="row"><div class="col align-self-center"><p id="scan-success-label">Scan result</p></div><div class="col-sm-auto align-self-center"><button data-container="body" id="copy-button" class="btn btn-secondary btn-sm tt text-end" onclick="copyScanOutput();" data-bs-placement="top" data-bs-original-title= "" title="">Copy</div></div></div><div id="scan-success"><div class="row"><div class="col my-auto"><p id="scan-success-output">'+decodedText+'</p></div></div></div>';
      primaryColumn.insertBefore(successfulScan, scanForm.nextSibling );
      //setup tooltips
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
    //checking if an error message section is already showing, if so, remove it.
    if (document.getElementById('scan-error-section') != null){
      const errorToRemove = document.getElementById('scan-error-section');
      errorToRemove.remove();
    }
    //checking if a scan-success is already showing, if so, remove it.
    if(document.getElementById('scan-success-section')){
      const scanSuccessToRemove = document.getElementById('scan-success-section');
      scanSuccessToRemove.remove();
    }
    //creating error message section
    const scanError = document.createElement("div");
    scanError.id = 'scan-error-section';
    scanError.classList = 'animate__animated animate__fadeInDown';
    const scanForm = document.getElementById('scan_form');
    const primaryColumn = document.getElementById('primary_column');
    //Only one error from library and it's not very useful, using a custom error message as formattedError 
    const formattedError = "<p>Make sure the barcode you want to scan is large, clearly visible, and one of the <a id='supported-formats-text' href='#' data-bs-toggle='modal' data-bs-target='#supportedFormatsModal'>supported formats</a>.</p>"
    scanError.innerHTML = '<p id="scan-error-label">Scan error</p><div id="scan-error">'+ formattedError+'</div>';
    primaryColumn.insertBefore(scanError, scanForm.nextSibling );
    //Print the scanning library error to the console
    console.log(`Error scanning file. Reason: ${error}`);
  });
});

window.addEventListener('paste',  e => {
  fileInput.files = e.clipboardData.files;
  const event = new Event('change');
  fileInput.dispatchEvent(event); 
});

// function for paste button.
async function pasteImage() {
  try {
    // navigator.clipboard.read() not supported in firefox, must be triggered from UI element in safari as of Jan 2023
    const clipboardContents = await navigator.clipboard.read();
    for (const item of clipboardContents) {
      if (!item.types.includes('image/png')) {
        const elem = document.getElementById('paste-button');
        const tooltip = bootstrap.Tooltip.getInstance(elem);
        elem.setAttribute("data-bs-original-title","What you pasted \n is not an image");
        tooltip.show();
        setTimeout(()=>{
          tooltip.hide();
        }, 2000);
        throw new Error('Clipboard contains non-image data.');        
      }
      const blob = await item.getType('image/png');
      var file = new File([blob], "name");
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
    }
    //then call a change event to display the image on the canvas
    const event = new Event('change');
    fileInput.dispatchEvent(event);
  }catch (err) {
    console.error(err.name, err.message);
  }
}

//Function for copy button
function copyScanOutput(){
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
        let canvas = document.getElementById('qr-canvas-visible');
        canvas.style.width = "auto";
        canvas.style.height = "100%";
        canvas.classList.add('animate__animated');
        canvas.classList.add('animate__fadeIn');
        reader.classList.remove('empty-reader-padding');
        reader.classList.add('filled-reader-padding');
        const resetButton = createResetButton();
        reader.insertBefore(resetButton, added_node );
			}
		});
	});
});

//Drag + drop functionality
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
  try{
    fileInput.files = files;
    const event = new Event('change');
    fileInput.dispatchEvent(event); 
  } catch {
    console.log('drop failed');
  }
}

//Creates reset (trash) button
function createResetButton() {
  const button = document.createElement('button');
  button.id ='reset-button';
  button.type = 'button';
  button.className = "btn btn-secondary btn-sm";
  button.onclick = function() {
    reset();
  }
  return button;
}

 //This function removes image from the file input, clears the preview canvas, and restores the buttons and controls like normal.
function reset() {
  html5QrCode.clear();
  //now insert controls.
  reader.appendChild(controls);
  reader.appendChild(orDragLabels);
  reader.classList.remove("filled-reader-padding");
  reader.classList.add("empty-reader-padding");
  fileInput.value = '';
  if (document.getElementById('scan-error-section') != null){
    const errorToRemove = document.getElementById('scan-error-section');
    errorToRemove.remove();
  }
  //checking if a scan-success is already showing, if so, remove it.
  if(document.getElementById('scan-success-section')){
    const scanSuccessToRemove = document.getElementById('scan-success-section');
    scanSuccessToRemove.remove();
  }
}
