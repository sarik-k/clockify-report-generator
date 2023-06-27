chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if ((msg.from === 'popup') && (msg.subject === 'get_clockify_report')) {
        let last_day_report = document.querySelector("entry-group");
        if (!last_day_report) return;

        let entries = [];

        last_day_report.querySelectorAll("time-tracker-entry, parent-tracker-entry").forEach((entry) => {
            let title = entry.querySelector("[placeholder='Add description']").value;
            let project = entry.querySelector("project-picker-label");
            let client = project.querySelector(".cl-listing-client").textContent || project.querySelector("a.cl-project-name").textContent;
            entries.push({ title, client })
        })
        getScreenShot(last_day_report.querySelector(".cl-card"))
            .then((img) => sendResponse({ entries, img }))
    }

    // Needed for asynchronous methods
    return true;

});

async function getScreenShot(el) {
    let img = null;
    await html2canvas(el).then(
        canvas => {
            const dataURL = canvas.toDataURL('image/png')
            img = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        })
    return img;
}