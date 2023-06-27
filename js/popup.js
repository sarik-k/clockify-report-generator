// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', async () => {

    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        const tab = tabs[0];
        // ...and send a request for the DOM info...
        if (tab.url.startsWith("https://app.clockify.me/tracker")) {
            chrome.tabs.sendMessage(
                tab.id,
                { from: 'popup', subject: 'get_clockify_report' },
                writeToPopup);
        } else {
            $(".loading").hide();
            $(".content-wrap").show();
            $(".content-wrap").html("Not clockify tracker site")
        }

    });
});
$(function () {
    $("#copy-button").on("click", copy);
})


function writeToPopup(info) {
    let link = uploadImage(info.img);
    $(".loading").hide();
    $(".content-wrap").show();
    $(".entries").html(formatOutput(info.entries, link))
};

function formatOutput(entries, link) {
    let output = "";

    let groups = entries.reduce(function (r, a) {
        r[a.client] = r[a.client] || [];
        r[a.client].push(a);
        return r;
    }, Object.create(null));


    Object.keys(groups).forEach((client) => {
        output += client;

        output += `<ul class="mb-0">`;
        groups[client].forEach(entry => {
            output += `<li> ${entry.title} \n </li>`
        });
        output += `</ul>`;
        output += '<br>';
    })
    output += `Clockify report:  <a href="${link}" target="_blank">${link}</a>`;

    return output;
}

function uploadImage(img) {
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
        success: function (response) {
            if (response.success) {
                link = response.data.link;
            }
        },
        cache: false,
        contentType: false,
        processData: false,
        async: false,
    });

    return link;
}

function copy() {
    const content = $(".content").html();
    const blob = new Blob([content], { type: 'text/html' });
    const clipboardItem = new window.ClipboardItem({ 'text/html': blob });
    navigator.clipboard.write([clipboardItem]);
}