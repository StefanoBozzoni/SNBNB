document.addEventListener("DOMContentLoaded", () => {
  const frameSelect = document.getElementById("frame-select");
  const htmlOutput = document.getElementById("html-output");
  const btnfetchHtml = document.getElementById("fetch-frame-html");
  const translatedtext = document.getElementById("translatedText");

  // Fetch the frames and populate the dropdown
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    const activeTab = tabs[0];

    chrome.webNavigation.getAllFrames({ tabId: activeTab.id }, (frames) => {
      console.log("Frames detected:", frames);

      if (chrome.runtime.lastError) {
        console.error("Error fetching frames:", chrome.runtime.lastError.message);
        htmlOutput.value = "Error fetching frames.";
        return;
      }

      if (!frames || frames.length === 0) {
        frameSelect.innerHTML = "<option>No frames found</option>";
        return;
      }

      frameSelect.innerHTML = frames
        .map((frame) => `<option value="${frame.frameId}">${frame.url || "(unnamed frame)"}</option>`)
        .join("");
		
      if (frames.length >= 1) {
		  frameSelect.selectedIndex = frames.length-1;
		  console.log("last frame:", frames[frames.length-1].url);
		  if (frames[frames.length-1].url === "about:blank") {
			if (frameSelect.selectedIndex >= 1) {frameSelect.selectedIndex--;}
		  }
		  btnfetchHtml.click();
	  }


    });
  });

  // Fetch the HTML of the selected frame
  document.getElementById("fetch-frame-html").addEventListener("click", () => {
    const frameId = parseInt(frameSelect.value, 10);
    if (isNaN(frameId)) {
      htmlOutput.value = "No frame selected!";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length === 0) {
        htmlOutput.value = "No active tab found.";
        return;
      }

      const activeTab = tabs[0];

 	chrome.scripting.executeScript(
	  {
		target: { tabId: activeTab.id, frameIds: [frameId] }, // Specify both tabId and frameId
		func: () => {
		  // Directly access the input field value inside the frame
			const numTask = document.querySelector("#sys_readonly\\.u_bug_test\\.number");
			var inputValue = numTask ? numTask.value.trim() : null; // Return the input's value or null if not found	  
			const description = document.querySelector("#sys_readonly\\.u_bug_test\\.short_description");
			const descriptionValue = description ? description.value.trim() : null; 
			
			//alert(inputValue);
			//alert(descriptionValue);
		    // Get the entire outerHTML of the frame's document
			const frameHtml = document.documentElement.outerHTML;
			if (inputValue.startsWith("BUG")) {
				inputValue = "fix/"+inputValue;
			}	
			if (inputValue.startsWith("STRY")) {
				inputValue = "feature/"+inputValue;
			}
			//.replace(/(?:\[Android\]|\[Ios\]|-\s)/g, "").trim()
			
			const description_with_underscores = descriptionValue
			.replace(/\[.*?\]/g, '').trim()
			.replace(/ /g, "_")
			.replace(/__/g, "_").slice(0, 50).trim();
			
			const name = inputValue+"_BOZZONI_";
			
			// Return both input value and HTML as an object
			return { name, frameHtml, description_with_underscores };
		},
	  },
	  (results) => {
		if (chrome.runtime.lastError) {
		  console.error("Error:", chrome.runtime.lastError.message);
		} else if (results && results[0]?.result) {
		  const { name, frameHtml, description_with_underscores } = results[0].result;
		  htmlOutput.value = frameHtml;
		  branchName.value = name+description_with_underscores;
		  const sentence = encodeURIComponent(description_with_underscores);
		  navigator.clipboard.writeText(name).then(() => {console.log('text copied to clipboard')}).catch(err => {console.error('filed to copy text', err)});

		  fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=en&dt=t&dt=bd&dj=1&q=${sentence}`)
		  .then(response => {
			if (!response.ok) {
			  throw new Error(`HTTP error! Status: ${response.status}`);
			}
			return response.json();
		  })
		  .then(data => {
			translatedText.value = name+data.sentences[0].trans;
			if (data.sentences[0].trans) {
				navigator.clipboard.writeText(translatedText.value).then(() => {console.log('text copied to clipboard')}).catch(err => {console.error('filed to copy text', err)});
			}
			console.log('Translation:', data);
			// Process the translation data as needed
		  })
		  .catch(error => {
			console.error('Error fetching translation:', error);
		  });

		  console.log("Input value:", results[0].result); // Value of the input field
		} else {
		  console.log("Input field not found or no result.");
		}
	  }
	);


    });
  });
});
