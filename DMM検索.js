javascript:(function() {
    function createSearchWindow() {
        let searchWindow = document.createElement("div");
        searchWindow.style.position = "fixed";
        searchWindow.style.top = "20px";
        searchWindow.style.right = "20px";
        searchWindow.style.padding = "10px";
        searchWindow.style.background = "white";
        searchWindow.style.border = "1px solid black";
        searchWindow.style.zIndex = "10000";
        searchWindow.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
        
        let titleBar = document.createElement("div");
        titleBar.textContent = "DMM検索";
        titleBar.style.fontWeight = "bold";
        titleBar.style.display = "flex";
        titleBar.style.justifyContent = "space-between";
        
        let closeButton = document.createElement("span");
        closeButton.textContent = "☒";
        closeButton.style.cursor = "pointer";
        closeButton.onclick = function() { document.body.removeChild(searchWindow); };
        
        titleBar.appendChild(closeButton);
        searchWindow.appendChild(titleBar);
        
        let inputField = document.createElement("input");
        inputField.type = "text";
        inputField.style.width = "250px";
        inputField.style.marginTop = "5px";
        inputField.value = window.location.href; 
        searchWindow.appendChild(inputField);
        
        let searchButton = document.createElement("button");
        searchButton.textContent = "検索";
        searchButton.style.display = "block";
        searchButton.style.marginTop = "5px";
        searchButton.onclick = function() {
            let url = decodeURIComponent(inputField.value.trim());
            
            let match = url.match(/product\/(\d+)/) 
                || url.match(/cid=(d_\d+)/) 
                || url.match(/cid=([^\/&]+)/);
            if (match) {
                window.open("https://www.google.com/search?q=dmm%20" + match[1], "_blank");
            } else {
                alert("商品番号を特定できませんでした。");
            }
        };
        
        searchWindow.appendChild(searchButton);
        document.body.appendChild(searchWindow);
    }
    createSearchWindow();
})();