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
            $(".content").show();
            $(".content").html("Not clockify tracker site")
        }

    });
});

function writeToPopup(info) {
    let link = uploadImage(info.img);
    $(".loading").hide();
    $(".content").show();
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
        output += `<strong>${client}</strong>`;

        output += `<ul>`;
        groups[client].forEach(entry => {
            output += `<li> ${entry.title} \n </li>`
        })
        output += `</ul>`
    })

    output += link;

    console.log(output);

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