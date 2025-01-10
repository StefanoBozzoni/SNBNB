document.addEventListener("DOMContentLoaded", () => {
  const frameSelect = document.getElementById("frame-select");
  const htmlOutput = document.getElementById("html-output");
  const btnfetchHtml = document.getElementById("fetch-frame-html");
  const translatedtext = document.getElementById("translatedText");

 
  function runWithDelays() {

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
			  i = frames.length - 1;
			  while (i > 0) {
				if (frames[i].url === "about:blank") {
					if (frameSelect.selectedIndex >= 1) {frameSelect.selectedIndex = i-1;}
				} else break;
				i--;
 			  }
			  btnfetchHtml.click();
		  }


		});

		
	  });
  };
  
  runWithDelays();

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

	const tabId =  activeTab.id; 
	console.log("activeTab id id: ", tabId);
	console.log("frame id: ", frameId);

 	chrome.scripting.executeScript(
	  {
		target: { tabId: activeTab.id, frameIds:[frameId] }, // Specify both tabId and frameId
		func: () => {
			console.log("Esecuzione script.");
			var numTask = document.querySelector("#sys_readonly\\.rm_story\\.number");
			var inputValue = numTask ? numTask.value.trim() : "";
			var description = ""
			var descriptionValue = ""
			if (inputValue.startsWith("STRY")) {
				description = document.querySelector("#sys_original\\.rm_story\\.short_description");
				descriptionValue = description ? description.value.trim() : null; 
				inputValue = "feature/"+inputValue;
			} else {
				numTask = document.querySelector("#sys_readonly\\.u_bug_test\\.number");
				inputValue = numTask ? numTask.value.trim() : ""; // Return the input's value or null if not found	  
				description = document.querySelector("#sys_original\\.u_bug_test\\.short_description");
				descriptionValue = description ? description.value.trim() : null; 
				if (inputValue.startsWith("BUG")) {
					inputValue = "fix/"+inputValue;
				}	
			}	

			const name = inputValue+"_BOZZONI_";

			const description_with_underscores = descriptionValue
			.replace(/\[.|-*?\]/g, '').trim()
			.replace(/ /g, "_")
			.replace(/-/g, "")
			.replace(/__/g, "_")
			.replace(/__/g, "_")
			.slice(0, 60).trim();

			const frameHtml = document.documentElement.outerHTML;
			return {name, frameHtml , description_with_underscores};
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
