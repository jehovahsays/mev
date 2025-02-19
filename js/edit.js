
      const myArticle = document.querySelector("article");
      const myLinks = document.querySelectorAll("ul a");
      for (const link of myLinks) {
        link.onclick = (e) => {
          e.preventDefault();
          const linkData = e.target.getAttribute("data-page");
          getData(linkData);
        };
      }

      function getData(pageId) {
        console.log(pageId);
        const myRequest = new Request(`${pageId}.txt`);

        fetch(myRequest)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error, status = ${response.status}`);
            }
            return response.text();
          })
          .then((text) => {
            myArticle.innerText = text;
          })
          .catch((error) => {
            myArticle.innerText = `Error: ${error.message}`;
          });
      }