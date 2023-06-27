chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // If the received message has the expected format...
    if (msg.text === 'get_clockify_report') {
        let last_day_report = document.querySelector("entry-group");
        if (!last_day_report) return;

        let entries = [];

        last_day_report.querySelectorAll("time-tracker-entry, parent-tracker-entry").forEach((entry) => {
            let title = entry.querySelector("[placeholder='Add description']").value;
            let project = entry.querySelector("project-picker-label");
            let client = project.querySelector(".cl-listing-client").textContent || project.querySelector("a.cl-project-name").textContent;
            entries.push({ title, client })
        })

        html2canvas(last_day_report.querySelector(".cl-card")).then(
            function (canvas) {
                const dataURL = canvas.toDataURL('image/png')
                const img = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
                let link = "";

                let formData = new FormData();
                formData.append("image", img);
                formData.append("type", "base64");

                $.ajax({
                    url: "https://api.imgur.com/3/image",
                    type: "POST",
                    datatype: "json",
                    headers: {
                      "Authorization": "Client-ID aca6d2502f5bfd8"
                    },
                    data: formData,
                    success: function(response) {
                      if (response.success) {
                        link = response.data.link;
                      }
                    },
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: false,
                  });
                
                  list(entries, link);
                  grouped(entries, link);

            })       

        sendResponse(msg);
    }

    function list(entries, link) {
        let list = "List view: \n\n"
        entries.forEach((entry) => {
            list += `• ${entry.title} (${entry.client}) \n`
        })
        list += `\n\n`;
        list += link;
        list += `\n\n`;
        console.log(list);
    }

    function grouped(entries, link) {
        let output = "Grouped view: \n\n"
        entries.forEach((entry) => {
            list += `${entry.title} (${entry.client}) \n`
        })

        let groups = entries.reduce(function (r, a) {
            r[a.client] = r[a.client] || [];
            r[a.client].push(a);
            return r;
        }, Object.create(null));

        Object.keys(groups).forEach((client) => {
            output += client + ":\n"

            groups[client].forEach(entry => {
                output += `• ${entry.title} \n`
            })

            output += "\n"
        })

        output += link;
        output += `\n\n`;

        console.log(output)
    }
});

