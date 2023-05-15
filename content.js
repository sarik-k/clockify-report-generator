chrome.runtime.onMessage.addListener( (msg, sender, sendResponse) => {
    // If the received message has the expected format...
    if (msg.text === 'get_clockify_report') {
        let last_day_report = document.querySelector("entry-group");
        if (!last_day_report) return;

        let entries = [];

        last_day_report.querySelectorAll("time-tracker-entry, parent-tracker-entry").forEach((entry) => {
            let title = entry.querySelector("[placeholder='Add description']").value;
            let project = entry.querySelector("project-picker-label");
            let client = project.querySelector(".cl-listing-client").textContent;
            entries.push({ title, client })
        })

        list(entries);
        grouped(entries);

        sendResponse(msg);
    }

    function list(entries) {
        let list = "List view: \n\n"
        entries.forEach((entry) => {
            list += `• ${entry.title} (${entry.client}) \n`
        })
        console.log(list);
    }
    
    function grouped(entries) {
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
    
        console.log(output)
    }
});

